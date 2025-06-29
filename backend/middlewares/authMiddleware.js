import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config(); 

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

export default authMiddleware;
