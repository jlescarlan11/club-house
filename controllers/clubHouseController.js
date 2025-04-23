const passport = require("passport");
const db = require("../db/queries");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const messageTrainerErr = "must be between 1 and 50 characters.";

const messageValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ min: 5, max: 50 })
    .withMessage("Title must be between 5-50 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ min: 5, max: 250 })
    .withMessage("Title must be between 5-250 characters"),
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

exports.welcomePageGet = async (req, res, next) => {
  if (req.user) {
    return res.redirect("/dashboard");
  }
  res.render("index");
};

exports.clubHouseGet = async (req, res, next) => {
  console.log(req.user);
  if (!req.user) {
    return res.redirect("/");
  }
  const messages = await db.getAllUserMessages();
  console.log(messages);
  console.log(req.params);

  req.session.views = (req.session.views || 0) + 1;
  res.render("dashboard", {
    views: req.session.views,
    user: req.user,
    messages: messages,
  });
};

exports.signUpGet = (req, res, next) => {
  res.render("sign-up-form");
};

exports.signUpPost = [
  validationSignUp,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("sign-up-form", { errors: errors.array() });
    }
    try {
      const { first_name, last_name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.signUpUser(first_name, last_name, email, hashedPassword);
      res.redirect("/dashboard");
    } catch (err) {
      next(err);
    }
  },
];

exports.logInGet = async (req, res, next) => {
  const raw = req.session.messages || [];
  const errors = raw.map((text) => ({ msg: text }));

  req.session.messages = [];
  res.render("signin-form", { errors });
};

exports.logInPost = passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureMessage: "Incorrect email or password",
  failureRedirect: "/",
});

exports.logOutGet = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.membershipFormGet = (req, res, next) => {
  res.render("membership-form", { user: req.user });
};

exports.membershipFormPost = async (req, res, next) => {
  try {
    const { passcode } = req.body;

    if (!req.user) {
      return res.render("membership-form", {
        errors: [{ msg: "You must be logged in to join the club" }],
        user: req.user,
      });
    }

    if (req.user.is_member) {
      return res.render("membership-form", {
        errors: [{ msg: "You are already a member of the club" }],
        user: req.user,
      });
    }

    if (passcode !== process.env.MEMBERSHIP_PASSCODE) {
      return res.render("membership-form", {
        errors: [{ msg: "Incorrect passcode. Please try again." }],
        user: req.user,
      });
    }

    req.user.is_member = true;
    await db.updateUserMembership(req.user.user_id, req.user);
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

exports.createMessageGet = async (req, res, next) => {
  try {
    res.render("create-message-form");
  } catch (err) {
    next(err);
  }
};

exports.createMessagePost = [
  messageValidation,
  async (req, res, next) => {
    const { title, content } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("create-message-form", {
        errors: errors.array(),
        title: title,
        content: content,
      });
    }
    try {
      const message = await db.createMessage(title, content);
      await db.createUserMessage(req.user.user_id, message.message_id);
      res.redirect("/dashboard");
    } catch (err) {
      next(err);
    }
  },
];

exports.adminFormGet = async (req, res, next) => {
  res.render("admin-form", { user: req.user });
};

exports.adminFormPost = async (req, res, next) => {
  try {
    const { passcode } = req.body;

    if (!req.user) {
      return res.render("admin-form", {
        errors: [{ msg: "You must be logged in to get access in the admin" }],
        user: req.user,
      });
    }

    if (req.user.is_member) {
      return res.render("admin-form", {
        errors: [{ msg: "You are already an admin" }],
        user: req.user,
      });
    }

    if (passcode !== process.env.ADMIN_PASSCODE) {
      return res.render("admin-form", {
        errors: [{ msg: "Incorrect passcode. Please try again." }],
        user: req.user,
      });
    }

    req.user.is_admin = true;
    await db.updateUserAdmin(req.user.user_id, req.user);
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

exports.updateMessageGet = async (req, res, next) => {
  try {
    const message = await db.getMessageById(req.params.id);

    res.render("update-message-form", { message: message });
  } catch (err) {
    next(err);
  }
};

exports.updateMessagePost = [
  messageValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("update-message-form", { errors: errors.array() });
    }
    const { id } = req.params;
    const { title, content } = req.body;
    console.log(content.trim());
    await db.updateMessage(id, title.trim(), content.trim());

    res.redirect("/dashboard");
  },
];

exports.deleteMessagePost = async (req, res, next) => {
  const { id } = req.params;
  await db.deleteMessage(id);

  res.redirect("/dashboard");
};

exports.forgetPasswordGet = async (req, res, next) => {
  res.render("forgot-password");
};

exports.forgetPasswordPost = async (req, res, next) => {
  const { email } = req.body;

  const user = await db.findUserByEmail(email);
  console.log(user);
  try {
    if (user) {
      res.redirect(`/reset-password/${user.user_id}`);
    }

    res.render("forgot-password", {
      errors: [{ msg: "Email does not exist." }],
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPasswordGet = async (req, res, next) => {
  const { id } = req.params;
  res.render("reset-password", { id: id });
};

exports.resetPasswordPost = [
  resetPasswordValidation,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const { id } = req.params;
      return res.render("reset-password", { errors: errors.array(), id });
    }
    try {
      const { id } = req.params;
      const { password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.resetPassword(id, hashedPassword);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];
