const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
    },
    qualifications: { type: String, trim: true },
    experience: { type: Number, default: 0 }, // years
    consultationFee: { type: Number, default: 0 },
    hospital: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: { type: String },
    availableSlots: [
      {
        day: {
          type: String,
          enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        },
        startTime: String, // "09:00"
        endTime:   String, // "17:00"
      },
    ],
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: populate doctor name from User
doctorSchema.virtual('name', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Doctor', doctorSchema);