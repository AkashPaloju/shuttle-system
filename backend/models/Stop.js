import mongoose from 'mongoose';

const StopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  campusZone: { type: String }, // Eg: 'North', 'South', 'East', 'West'
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true }
});

export default mongoose.model('Stop', StopSchema);
