const mongoose = require("mongoose");
const Account = require("../models/account");

const getBalance = async (req, res) => {
  const id = req.userId;

  try {
    const account = await Account.findOne({ userId: id });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Account balance retrieved successfully",
      data: {
        balance: account.balance,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const transferMoney = async (req, res) => {
  const { toAccountId, amount } = req.body;
  const id = req.userId;

  if (!id || !toAccountId || !amount) {
    return res.status(400).json({
      success: false,
      message: "Sender/Receiver Id and Amount are required",
    });
  }

  if (id === toAccountId) {
    return res
      .status(400)
      .json({ success: false, message: "Sender and Receiver cannot be same" });
  }

  try {
    const senderAccount = await Account.findOne({ userId: id });
    const receiverAccount = await Account.findOne({ userId: toAccountId });

    if (!senderAccount || !receiverAccount) {
      return res.status(400).json({
        success: false,
        message: "Invalid sender or receiver account",
      });
    }

    if (senderAccount.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    senderAccount.balance -= amount;
    receiverAccount.balance += amount;

    await senderAccount.save();
    await receiverAccount.save();

    return res.status(200).json({
      success: true,
      message: "Amount transferred successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getBalance,
  transferMoney,
};
