const initializePassport = require("./config/passport");
const pool = require("./db/pool");
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const clubHouseRouter = require("./routes/clubHouseRouter");

const pgSession = require("connect-pg-simple")(session);

const sessionStore = new pgSession({
  pool: pool,
  tableName: process.env.SESSION_TABLE_NAME,
  createTableIfMissing: true,
});

const app = express();
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

initializePassport(passport);
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", clubHouseRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
