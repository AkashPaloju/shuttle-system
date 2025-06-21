import mongoose from 'mongoose';

const ShuttleSchema = new mongoose.Schema({
  shuttleNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  currentRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  active: { type: Boolean, default: true },
  currentLocation: { type: String }, // Can extend to GPS later
  occupancy: { type: Number, default: 0 },
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true }
});

export default mongoose.model('Shuttle', ShuttleSchema);
