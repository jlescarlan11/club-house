const { Router } = require("express");
const clubHouseRouter = Router();
const clubHouseController = require("../controllers/clubHouseController");

clubHouseRouter.get("/", clubHouseController.clubHouseGet);
clubHouseRouter.get("/sign-up", clubHouseController.signUpGet);
clubHouseRouter.post("/sign-up", clubHouseController.signUpPost);
clubHouseRouter.get("/log-in", clubHouseController.logInGet);
clubHouseRouter.post("/log-in", clubHouseController.logInPost);
clubHouseRouter.get("/log-out", clubHouseController.logOutGet);
clubHouseRouter.get("/membership-form", clubHouseController.membershipFormGet);
clubHouseRouter.post(
  "/membership-form",
  clubHouseController.membershipFormPost
);
clubHouseRouter.get("/messages/new", clubHouseController.createMessageGet);
clubHouseRouter.post("/messages/new", clubHouseController.createMessagePost);

module.exports = clubHouseRouter;
