const { Router } = require("express");
const clubHouseRouter = Router();
const clubHouseController = require("../controllers/clubHouseController");

clubHouseRouter.get("/", clubHouseController.welcomePageGet);
clubHouseRouter.get("/dashboard", clubHouseController.clubHouseGet);
clubHouseRouter.post("/dashboard", clubHouseController.clubHousePost);
clubHouseRouter.get("/signup", clubHouseController.signUpGet);
clubHouseRouter.post("/signup", clubHouseController.signUpPost);
clubHouseRouter.get("/", clubHouseController.logInGet);
clubHouseRouter.post("/", clubHouseController.logInPost);
clubHouseRouter.get("/log-out", clubHouseController.logOutGet);
clubHouseRouter.get("/membership-form", clubHouseController.membershipFormGet);
clubHouseRouter.post(
  "/membership-form",
  clubHouseController.membershipFormPost
);
clubHouseRouter.get("/admin-form", clubHouseController.adminFormGet);
clubHouseRouter.post("/admin-form", clubHouseController.adminFormPost);
clubHouseRouter.get("/messages/edit/:id", clubHouseController.updateMessageGet);
clubHouseRouter.post(
  "/messages/edit/:id",
  clubHouseController.updateMessagePost
);
clubHouseRouter.post(
  "/messages/delete/:id",
  clubHouseController.deleteMessagePost
);
clubHouseRouter.get("/forgot-password", clubHouseController.forgetPasswordGet);
clubHouseRouter.post(
  "/forgot-password",
  clubHouseController.forgetPasswordPost
);
clubHouseRouter.get(
  "/reset-password/:id",
  clubHouseController.resetPasswordGet
);
clubHouseRouter.post(
  "/reset-password/:id",
  clubHouseController.resetPasswordPost
);

module.exports = clubHouseRouter;
