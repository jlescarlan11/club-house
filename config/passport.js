const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await db.getUserByEmail(email);
          const match = await bcrypt.compare(password, user.password);

          if (!user) return done(null, false, { message: "Incorrect email" });
          if (!match)
            return done(null, false, { message: "Incorrect password" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Serialization/deserialization
  passport.serializeUser((user, done) => done(null, user.user_id));
  passport.deserializeUser(async (user_id, done) => {
    try {
      done(null, await db.getUserById(user_id));
    } catch (err) {
      done(err);
    }
  });
};
