import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    banner: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    industry: {
      type: String,
      default: ''
    },
    headquarters: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    foundedYear: {
      type: Number
    },
    companySize: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' }
    },
    recruiters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Company = mongoose.model('Company', CompanySchema);

export default Company;
