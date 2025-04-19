// const express = require("express");
// const session = require("express-session");
// const passport = require("passport");
// const path = require("path");
// const initializePassport = require("./config/passport");
// const pool = require("./db/pool");
// const pgSession = require("connect-pg-simple")(session);
// const clubHouseRouter = require("./routes/clubHouseRouter");

// const app = express();

// // configuration
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

// // middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));
// const sessionStore = new pgSession({
//   pool: pool,
//   tableName: "user_session",
//   createTableIfMissing: true,
// });
// app.use(
//   session({
//     secret: "some secret",
//     resave: false,
//     saveUninitialized: false,
//     store: sessionStore,
//     cookie: {
//       maxAge: 30 * 24 * 60 * 60 * 1000,
//     },
//   })
// );

// // passport
// initializePassport(passport);
// app.use(passport.session());

// app.use(clubHouseRouter);

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log("Server is listening on port 3000");
// });

const bcrypt = require("bcryptjs");
const path = require("node:path");
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "club_house",
  port: 5432,
  password: "Asotpusa*2",
});

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const { rows } = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }
        // if (user.password !== password) {
        //   return done(null, false, { message: "Incorrect password" });
        // }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (user_id, done) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );
    const user = rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => res.render("index"));
app.get("/sign-up", (req, res) => res.render("sign-up-form"));
app.post("/sign-up", async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users 
       (first_name, last_name, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [first_name, last_name, email, hashedPassword]
    );
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});
app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.get("/log-out", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
});

app.listen(3000, () => console.log("app listening on port 3000!"));
