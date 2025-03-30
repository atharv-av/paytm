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

module.exports = {
  getBalance,
};