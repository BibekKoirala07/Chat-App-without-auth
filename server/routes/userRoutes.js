const express = require("express");
const userRoutes = express.Router();
const User = require("../models/User");
const { default: mongoose } = require("mongoose");

userRoutes.post("/add", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newUser = new User({ name });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User added successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

userRoutes.get("/getUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findById(id);
    // console.log("user", user);

    if (!user) {
      throw Error("User not found");
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: "User not found" });
  }
});

userRoutes.get("/getAllUsers/:id", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id); // Convert to ObjectId

    const users = await User.find({ _id: { $ne: userId } }).lean();

    // const responseData = await Promise.all(
    //   users.map(async (user) => {
    //     // Fetch chat where both users are members
    //     const chat = await Chat.findOne({
    //       members: { $all: [userId, user._id] },
    //     }).lean();

    //     return {
    //       ...user,
    //       chatId: chat ? chat : null,
    //     };
    //   })
    // );

    const responseData = users;

    // console.log("data", responseData);

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error hoina, query error ho",
    });
  }
});

module.exports = userRoutes;
