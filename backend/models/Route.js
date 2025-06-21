import mongoose from 'mongoose';

const RouteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true }],
  timingSlots: [
    {
      startTime: { type: String, required: true }, // e.g., "08:00"
      endTime: { type: String, required: true },   // e.g., "08:30"
      days: [{ type: String, required: true }],    // e.g., ["Mon", "Wed", "Fri"]
    },
  ],
  optimizedFor: [String], // ["Peak Hour", "Class Schedule", "Demand"]
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true }
}, {
  timestamps: true
});

export default mongoose.model('Route', RouteSchema);
