const zod = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Account = require("../models/account");

const userSchema = zod.object({
  firstName: zod.string().min(1).max(50).optional(),
  lastName: zod.string().min(1).max(50).optional(),
  username: zod.string().min(3).max(50).optional(),
  password: zod.string().min(6).optional(),
});

const registerUser = async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  const { success } = userSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Some required fields are either missing or invalid",
    });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      username,
      password: hashedPassword,
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const account = new Account({
      userId: newUser._id,
      balance: 1 + Math.floor(Math.random() * 1000),
    });
    await account.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateUser = async (req, res) => {
  const { firstName, lastName, username, password } = req.body;
  const id = req.userId; // Ensure this is correctly set by the middleware
  const { success } = userSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found", // Use 404 for not found
      });
    }

    const newUserData = {
      firstName,
      lastName,
      username,
    };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      newUserData.password = hashedPassword;
    }

    await User.updateOne({ _id: id }, newUserData);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getAllUsers = async (req, res) => {
  const { filter } = req.query;
  try {
    const users = await User.find();
    if (filter) {
      const filteredUsers = users.filter((user) => {
        return (
          user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
          user.lastName.toLowerCase().includes(filter.toLowerCase())
        );
      });

      if (filteredUsers.length === 0) {
        return res.status(404).json({
          message: "No users found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: filteredUsers.map((user) => ({
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        })),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users.map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  getAllUsers,
};
