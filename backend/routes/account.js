const express = require("express");
const authMiddleware = require("../middleware");
const {
  getBalance,
  transferMoney,
} = require("../controllers/accountControllers");
const accountRouter = express.Router();

accountRouter.get("/account/balance", authMiddleware, getBalance);
accountRouter.post("account/transfer", authMiddleware, transferMoney);

module.exports = accountRouter;
