import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  description: { type: String },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'admin', 'upi', 'kiosk'],
    // 'wallet' for ride payments, 'admin' for admin adjustments, 'upi' for user online recharges, 'kiosk' for kiosk top-ups
    required: true,
    default: 'wallet',
  },
  status: {
    type: String,
    enum: ['success', 'pending', 'failed'],
    default: 'success',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', TransactionSchema);
