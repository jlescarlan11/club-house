const passport = require("passport");
const db = require("../db/queries");
const bcrypt = require("bcryptjs");

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

exports.signUpPost = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.signUpUser(first_name, last_name, email, hashedPassword);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

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
