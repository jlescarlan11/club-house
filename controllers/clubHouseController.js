const db = require("../db/queries");

exports.clubHouseGet = async (req, res, next) => {
  req.session.views = (req.session.views || 0) + 1;
  res.render("index", { views: req.session.views });
  //   res.render("sign-up-form");
};

exports.signUpGet = async (req, res, next) => {
  res.render("sign-up-form");
};

exports.signUpPost = async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    await db.signUpUser(first_name, last_name, email, password);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};
