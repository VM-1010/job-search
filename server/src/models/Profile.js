import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, default: '' },
    place: { type: String, default: '' },
    contact: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    about: { type: String, default: '' },
    education: [{ type: String }],
    experience: [{ type: String }],
    training: [{ type: String }],
    competitions: [{ type: String }],
  },
  { timestamps: true }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
