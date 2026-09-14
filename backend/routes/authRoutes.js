const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/test", (req, res) => {
  res.json({
    message: "Auth Route Working",
  });
});

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const user = new User({
      fullName,
      email,
      password,
      role,
    });

    await user.save();

    res.status(201).json({
      message: "Registration Successful",
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;