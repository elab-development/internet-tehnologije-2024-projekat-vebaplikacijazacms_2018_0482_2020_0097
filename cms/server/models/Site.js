import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const siteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    template: {
      type: String,
      enum: ['classic', 'magazine'],
      default: 'classic',
    },
    theme: {
      primary: { type: String, default: '#111827' },
      accent: { type: String, default: '#10B981' },
      font: { type: String, default: 'Inter' },
      logoUrl: { type: String },
    },
    owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    editors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    homepage: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
    isPublished: { type: Boolean, default: false },
    customDomain: { type: String },
  },
  { timestamps: true }
);

siteSchema.pre('validate', function (next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

siteSchema.methods.isOwner = function (userId) {
  return this.owners?.some((id) => String(id) === String(userId));
};
siteSchema.methods.canEditPosts = function (userId) {
  return (
    this.isOwner(userId) ||
    this.editors?.some((id) => String(id) === String(userId))
  );
};

export default mongoose.model('Site', siteSchema);
