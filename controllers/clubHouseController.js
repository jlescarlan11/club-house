const passport = require("passport");
const db = require("../db/queries");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const messageTrainerErr = "must be between 1 and 50 characters.";

const { body } = require("express-validator");

const validationSignUp = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2-50 characters")
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

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

exports.clubHouseGet = (req, res, next) => {
  console.log(req.user);
  if (!req.user) {
    return res.redirect("/log-in");
  }
  req.session.views = (req.session.views || 0) + 1;
  res.render("index", { views: req.session.views, user: req.user });
};

exports.signUpGet = (req, res, next) => {
  res.render("sign-up-form");
};

exports.signUpPost = [
  validationSignUp,
  async (req, res, next) => {
    try {
      const { first_name, last_name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.signUpUser(first_name, last_name, email, hashedPassword);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];

exports.logInGet = async (req, res, next) => {
  res.render("log-in-form");
};

exports.logInPost = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
});

exports.logOutGet = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/log-in");
  });
};
