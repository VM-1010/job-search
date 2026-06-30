import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
      unique: true,
    },
    companyName: { type: String, default: '' },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
  },
  { timestamps: true }
);

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

export default CompanyProfile;
