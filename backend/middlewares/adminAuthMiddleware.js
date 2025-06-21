import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied: Admins only" });
    }
    req.universityId = user.universityId; // Store universityId for further use
    console.log("Admin access granted for user:", user._id, "uni id:", req.universityId);
    next();
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

export default adminMiddleware;
