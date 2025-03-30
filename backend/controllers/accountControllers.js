const mongoose = require("mongoose");
const Account = require("../models/account");

const getBalance = async (req, res) => {
  const { id } = req.userId;

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
  const session = await mongoose.startSession();
  session.startTransaction();

  const { toAccountId, amount } = req.body;
  const fromAccountId = req.userId;

  if (!fromAccountId || !toAccountId || amount) {
    return res.status(400).json({
      success: false,
      message: "Sender/Receiver Id and Amount are required",
    });
  }

  if (fromAccountId === toAccountId) {
    return res
      .status(400)
      .json({ success: false, message: "Sender and Receiver cannot be same" });
  }

  try {
    const receiver = await Account.findOne({ toAccountId }).session(session);

    if (!receiver) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    );
    await Account.updateOne(
      { userId: toAccountId },
      { $inc: { balance: amount } }
    );

    await session.commitTransaction();

    return res
      .status(200)
      .json({ success: true, message: "Amount transferred successfully" });
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
