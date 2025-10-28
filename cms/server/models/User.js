import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      index: true,
    },
    sites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Site' }],
  },
  { timestamps: true }
);

userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

export default mongoose.model('User', userSchema);
