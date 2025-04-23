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
          // 1. Fetch user
          const user = await db.getUserByEmail(email);

          // 2. Immediately bail if email not found
          if (!user) {
            return done(null, false, { message: "Incorrect email" });
          }

          // 3. Now it’s safe to compare passwords
          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return done(null, false, { message: "Incorrect password" });
          }

          // 4. Success
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
      const user = await db.getUserById(user_id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
