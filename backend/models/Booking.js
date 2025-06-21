import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shuttleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shuttle', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  sourceStopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
  destinationStopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
  fare: { type: Number, required: true },
  bookingTime: { type: Date, default: Date.now },
  rideStartTime: { type: Date },
  rideEndTime: { type: Date },
  status: {
    type: String,
    enum: ['upcoming', 'cancelled', 'completed', 'in-progress'],
    default: 'upcoming',
  },
});

export default mongoose.model('Booking', BookingSchema);
