const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    visitType: {
      type: String,
      enum: ['In-Person', 'Video'],
      default: 'In-Person',
    },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    documents: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    doctorNotes: { type: String },         // added by doctor post-visit
    prescription: { type: String },        // follow-up prescription text
    cancelledBy: { type: String },         // 'patient' | 'doctor'
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);