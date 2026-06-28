import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const RecruiterSchema = new mongoose.Schema(
  {
    recruiterName: {
      type: String,
      required: [true, 'Recruiter name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    profilePicture: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Hash the password before saving it
RecruiterSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
RecruiterSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Recruiter = mongoose.model('Recruiter', RecruiterSchema);

export default Recruiter;
