import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    requirements: {
      type: String,
      required: [true, 'Job requirements are required']
    },
    responsibilities: {
      type: String,
      required: [true, 'Job responsibilities are required']
    },
    skills: {
      type: [String],
      default: []
    },
    salaryRange: {
      type: String,
      default: ''
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']
    },
    experienceLevel: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Manager', 'Executive']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Job category is required'],
      trim: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required']
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
      required: [true, 'Recruiter reference is required']
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open'
    }
  },
  {
    timestamps: true
  }
);

// Enable text indexing for job searches
JobSchema.index({ title: 'text', description: 'text', skills: 'text' });

const Job = mongoose.model('Job', JobSchema);

export default Job;
