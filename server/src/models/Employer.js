import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  role: { type: String, default: 'employer' },
});

const Employer = mongoose.model('Employer', employerSchema);

export default Employer;
