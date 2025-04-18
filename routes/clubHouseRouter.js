const { Router } = require("express");
const clubHouseRouter = Router();
const clubHouseController = require("../controllers/clubHouseController");

clubHouseRouter.get("/", clubHouseController.clubHouseGet);
clubHouseRouter.get("/sign-up", clubHouseController.signUpGet);
clubHouseRouter.post("/sign-up", clubHouseController.signUpPost);

module.exports = clubHouseRouter;
