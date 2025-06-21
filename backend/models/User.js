import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true,
  },
  walletBalance: { type: Number, default: 500, min: 0 },
  transactions: [
    {
      amount: { type: Number, required: true },
      type: { type: String, enum: ["credit", "debit"], required: true },
      description: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
