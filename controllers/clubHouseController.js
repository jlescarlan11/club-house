const passport = require("passport");
const db = require("../db/queries");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const messageTrainerErr = "must be between 1 and 50 characters.";

const messageValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({ max: 1000 })
    .withMessage("Message must be at most 1000 characters"),
  ,
];

const resetPasswordValidation = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("confirm_password")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const validationSignUp = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 4, max: 50 })
    .withMessage("First name must be between 4-50 characters")
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage(
      "First name can only contain letters, accents, spaces, apostrophes, and hyphens"
    ),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2-50 characters")
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage(
      "Last name can only contain letters, accents, spaces, apostrophes, and hyphens"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("confirm_password")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

// Controller actions
exports.welcomePageGet = (req, res) => {
  if (req.user) return res.redirect("/dashboard");
  res.render("index");
};

exports.clubHouseGet = async (req, res, next) => {
  try {
    if (!req.user) return res.redirect("/");
    const messages = await db.getAllUserMessages();
    req.session.views = (req.session.views || 0) + 1;
    res.render("dashboard", {
      views: req.session.views,
      user: req.user,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

exports.clubHousePost = [
  messageValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    const { content } = req.body;
    content.trim();
    if (!errors.isEmpty()) {
      return res.render("dashboard", {
        user: req.user,
        messages: await db.getAllUserMessages(),
        errors: errors.array(),
        content,
      });
    }
    try {
      const message = await db.createMessage(content.trim());
      await db.createUserMessage(req.user.user_id, message.message_id);
      res.redirect("/dashboard");
    } catch (err) {
      next(err);
    }
  },
];

exports.signUpGet = (req, res) => res.render("sign-up-form");

exports.signUpPost = [
  validationSignUp,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("sign-up-form", { errors: errors.array() });
    }
    try {
      const { first_name, last_name, email, password } = req.body;
      const hashed = await bcrypt.hash(password, 10);
      await db.signUpUser(
        first_name.trim(),
        last_name.trim(),
        email.trim(),
        hashed
      );
      res.redirect("/dashboard");
    } catch (err) {
      next(err);
    }
  },
];

exports.logInGet = (req, res) => {
  const raw = req.session.messages || [];
  const errors = raw.map((msg) => ({ msg }));
  req.session.messages = [];
  res.render("signin-form", { errors });
};

exports.logInPost = passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/",
  failureMessage: "Incorrect email or password",
});

exports.logOutGet = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

exports.membershipFormGet = (req, res) =>
  res.render("membership-form", { user: req.user });

exports.membershipFormPost = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.render("membership-form", {
        errors: [{ msg: "You must be logged in to join the club" }],
        user: req.user,
      });
    }
    if (req.user.is_member) {
      return res.render("membership-form", {
        errors: [{ msg: "You are already a member" }],
        user: req.user,
      });
    }
    if (req.body.passcode !== process.env.MEMBERSHIP_PASSCODE) {
      return res.render("membership-form", {
        errors: [{ msg: "Incorrect passcode" }],
        user: req.user,
      });
    }
    await db.updateUserMembership(req.user.user_id, true);
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

exports.adminFormGet = (req, res) =>
  res.render("admin-form", { user: req.user });

exports.adminFormPost = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.render("admin-form", {
        errors: [{ msg: "Login required to access admin" }],
        user: req.user,
      });
    }
    if (req.user.is_admin) {
      return res.render("admin-form", {
        errors: [{ msg: "Already an admin" }],
        user: req.user,
      });
    }
    if (req.body.passcode !== process.env.ADMIN_PASSCODE) {
      return res.render("admin-form", {
        errors: [{ msg: "Incorrect admin passcode" }],
        user: req.user,
      });
    }
    await db.updateUserAdmin(req.user.user_id, true);
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

// GET form to edit message
exports.updateMessageGet = async (req, res, next) => {
  try {
    const messages = await db.getAllUserMessages();
    const messageContent = await db.getMessageById(req.params.id);
    messageContent.content = messageContent.content.trim();
    res.render("update-message-form", {
      messageContent,
      user: req.user, // ← add this
      messages,
    });
  } catch (err) {
    next(err);
  }
};

// POST updated message content
exports.updateMessagePost = [
  messageValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    const { content } = req.body;
    const { id } = req.params;
    // after
    if (!errors.isEmpty()) {
      return res.render("update-message-form", {
        errors: errors.array(),
        user: req.user, // ← add this
        message: {
          message_id: id,
          content: req.body.content, // ← re-populate the input
        },
      });
    }
    try {
      await db.updateMessage(id, content.trim());
      res.redirect("/dashboard");
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteMessagePost = async (req, res, next) => {
  try {
    await db.deleteMessage(req.params.id);
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

exports.forgetPasswordGet = (req, res) => res.render("forgot-password");

exports.forgetPasswordPost = async (req, res, next) => {
  try {
    const user = await db.findUserByEmail(req.body.email.trim());
    if (!user) {
      return res.render("forgot-password", {
        errors: [{ msg: "Email does not exist." }],
      });
    }
    res.redirect(`/reset-password/${user.user_id}`);
  } catch (err) {
    next(err);
  }
};

// GET and POST for resetting password
exports.resetPasswordGet = (req, res) => {
  res.render("reset-password", { id: req.params.id });
};

exports.resetPasswordPost = [
  resetPasswordValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    const { id } = req.params;
    if (!errors.isEmpty()) {
      return res.render("reset-password", { errors: errors.array(), id });
    }
    try {
      const hashed = await bcrypt.hash(req.body.password.trim(), 10);
      await db.resetPassword(id, hashed);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];
