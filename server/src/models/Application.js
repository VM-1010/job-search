import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Interview', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Application = mongoose.model('Application', applicationSchema);

export default Application;
