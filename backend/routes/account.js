const express = require("express");
const authMiddleware = require("../middleware");
const { getBalance } = require("../controllers/accountControllers");
const accountRouter = express.Router();

accountRouter.get("/account/balance", authMiddleware, getBalance);

module.exports = accountRouter;
