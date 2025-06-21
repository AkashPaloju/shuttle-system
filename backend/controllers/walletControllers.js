import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

// Get current user's wallet balance and transactions
const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json({
      walletBalance: user.walletBalance,
      transactions,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Recharge wallet (student)
const rechargeWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.walletBalance += amount;
    await user.save();
    await Transaction.create({
      userId: user._id,
      amount,
      type: "credit",
      description: "Wallet recharge",
      paymentMethod: "upi",
      status: "success",
    });
    res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: assign or adjust points for a user
const updateWalletBalance = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    if (!userId || !amount) {
      return res.status(400).json({ msg: "userId and amount required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.walletBalance += amount;
    await user.save();
    await Transaction.create({
      userId: user._id,
      amount,
      type: amount > 0 ? "credit" : "debit",
      description: (amount > 0 ? "Admin credit: " : "Admin debit: ") + (description || ""),
      paymentMethod: "admin",
      status: "success",
    });
    res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: update wallet balance for all students in the same university
const updateWalletBalanceToAllStudents = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const universityId = req.universityId; // from adminMiddleware
    const users = await User.find({ universityId, role: "student" });
    if (users.length === 0) {
      return res.status(404).json({ msg: "No students found in this university" });
    }
    for (const user of users) {
      user.walletBalance += amount;
      await user.save();
      await Transaction.create({
        userId: user._id,
        amount,
        type: amount > 0 ? "credit" : "debit",
        description: (amount > 0 ? "Admin credit: " : "Admin debit: ") + (description || ""),
        paymentMethod: "admin",
        status: "success",
      });
    }
    res.json({ msg: "Wallet balance updated for all students" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get wallet statement/expense report (student)
const getWalletStatement = async (req, res) => {
  try {
    const { period } = req.query; // e.g., 'month'
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    let query = { userId: user._id };
    if (period === "month") {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      query.createdAt = { $gte: firstDay };
    }
    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    res.json({
      walletBalance: user.walletBalance,
      transactions,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: get all users' wallets
const getAllWallets = async (req, res) => {
  try {
    const users = await User.find({}, "name email walletBalance");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const walletControllers = {
  getWallet,
  rechargeWallet,
  updateWalletBalance,
  getWalletStatement,
  getAllWallets,
  updateWalletBalanceToAllStudents,
};