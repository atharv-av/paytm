const express = require("express");
const rootRouter = express.Router();
const userRouter = require("./user");

rootRouter.use("/user", userRouter);

module.exports = rootRouter;
