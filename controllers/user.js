const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");

function generateAccessToken(id) {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET);
}

exports.postSignup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const user = await User.findAll({ where: { email } });
    if (user.length > 0) {
      return res.status(409).json({ message: "user already exists!" });
    }
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      await User.create({ name, email, password: hash, phone });
      return res
        .status(201)
        .json({ message: "Successfully created new user!" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    bcrypt.compare(password, user.password, (err, matchedPassword) => {
      if (!matchedPassword) {
        return res
          .status(401)
          .json({ message: "Authorization denied!", error: err });
      }
      return res.status(200).json({
        message: "Login Successful!",
        token: generateAccessToken(user.id),
        name:user.name
      });
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
