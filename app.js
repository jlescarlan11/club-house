const path = require("path");
const pool = require("./db/pool");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const clubHouseRouter = require("./routes/clubHouseRouter");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());

const sessionStore = new pgSession({
  pool: pool,
  tableName: "user_session",
  createTableIfMissing: true,
});

app.use(
  session({
    secret: "some secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/",
  clubHouseRouter

  // (req, res) => {
  // req.session.views = (req.session.views || 0) + 1;
  // // res.send(
  // //   `<h1>Hello World (Sessions)</h1><p>Views:dd ${req.session.views}</p>`
  // // );
  // res.render("index", { views: req.session.views });
  // }
);

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected:", res.rows[0]);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
