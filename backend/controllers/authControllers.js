import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import authMiddleware from "../middlewares/authMiddleware.js";
import University from "../models/University.js";
import User from "../models/User.js";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    console.log("Register request received:", req.body);
    const { name, email, password, universityId } = req.body;

    const isExistingUser = await User.findOne({ email });
    if (isExistingUser)
      return res.status(400).json({ msg: "User already exists" });

    const university = await University.findOne({ universityId });
    if (!university)
      return res.status(400).json({ msg: "University does not exist" });

    const emailDomain = email.split("@")[1];
    const universityDomain = university.universityDomain;
    if (emailDomain !== universityDomain) {
      return res
        .status(400)
        .json({ msg: "Email does not match university domain" });
    }

    // If the email is in the university's admin emails, set role to admin
    const isAdmin = university.universityAdminEmails.includes(email);
    const role = isAdmin ? "admin" : "student";
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      universityId: university._id,
      walletBalance: 500,
      role,
      transactions: [{
        amount: 500,
        type: "credit",
        description: "Initial wallet balance",
        date: new Date(),
      }]
    });

    await newUser.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "User not found. Please register first." });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) 
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "24h",
    });

    res.json({
      token,
      expiresIn: 3600,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const authControllers = {
  register,
  login,
};