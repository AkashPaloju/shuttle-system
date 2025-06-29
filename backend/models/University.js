import mongoose from "mongoose";

const UniversitySchema = new mongoose.Schema({
  universityId: { type: String, required: true, unique: true },
  universityName: { type: String, required: true },
  universityLocation: { type: String, required: true },
  universityDomain: { type: String, required: true },
  universityAdminEmails: { type: [String], required: true },
});

export default mongoose.model("University", UniversitySchema);
