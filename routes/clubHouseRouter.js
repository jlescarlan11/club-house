const { Router } = require("express");
const clubHouseRouter = Router();
const clubHouseController = require("../controllers/clubHouseController");

clubHouseRouter.get("/", clubHouseController.clubHouseGet);
clubHouseRouter.get("/sign-up", clubHouseController.signUpGet);
clubHouseRouter.post("/sign-up", clubHouseController.signUpPost);
clubHouseRouter.get("/log-in", clubHouseController.logInGet);
clubHouseRouter.post("/log-in", clubHouseController.logInPost);
clubHouseRouter.get("/log-out", clubHouseController.logOutGet);

module.exports = clubHouseRouter;
