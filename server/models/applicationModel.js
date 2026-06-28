import mongoose from 'mongoose';

// Education snapshot schema
const EducationSnapshotSchema = new mongoose.Schema({
  school: { type: String, default: '' },
  degree: { type: String, default: '' },
  fieldOfStudy: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, default: '' }
}, { _id: false });

// Experience snapshot schema
const ExperienceSnapshotSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  position: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' }
}, { _id: false });

// Certification snapshot schema
const CertificationSnapshotSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  issuer: { type: String, default: '' },
  issueDate: { type: Date },
  expirationDate: { type: Date },
  credentialId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' }
}, { _id: false });

// Project snapshot schema
const ProjectSnapshotSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date }
}, { _id: false });

// Skill snapshot schema
const SkillSnapshotSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  level: { type: String, default: '' }
}, { _id: false });

// Profile snapshot schema
const ProfileSnapshotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  headline: { type: String, default: '' },
  location: { type: String, default: '' },
  resume: { type: String, default: '' },
  education: [EducationSnapshotSchema],
  experience: [ExperienceSnapshotSchema],
  certifications: [CertificationSnapshotSchema],
  projects: [ProjectSnapshotSchema],
  skills: [SkillSnapshotSchema]
}, { _id: false });

const ApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required']
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
      required: [true, 'Recruiter reference is required']
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required']
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required']
    },
    coverLetter: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Accepted'],
      default: 'Applied'
    },
    profileSnapshot: {
      type: ProfileSnapshotSchema,
      required: [true, 'Profile snapshot is required']
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate applications for a job by the same seeker
ApplicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;
