import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
});

const User = mongoose.model('User', userSchema);

export default User;
