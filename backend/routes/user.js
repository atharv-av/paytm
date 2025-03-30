const express = require("express");
const { registerUser, loginUser, updateUser, getAllUsers } = require("../controllers/userControllers");
const authMiddleware = require("../middleware");
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.put("/user", authMiddleware, updateUser)
userRouter.get("/users", authMiddleware, getAllUsers)

module.exports = userRouter;
