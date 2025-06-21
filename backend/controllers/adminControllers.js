import User from "../models/User.js";

const getUsers = async (req, res) => {
  try {
    // Fetching students from the same university as the admin
    const universityId = req.universityId; // from adminMiddleware
    const users = await User.find({ universityId, role: "student" },
      "name email walletBalance transactions rideHistory"
    );

    res.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const adminControllers = {
  getUsers
};