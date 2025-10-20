import mongoose from 'mongoose';

const { Schema } = mongoose;

const blockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    props: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    site: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      index: true,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    excerpt: { type: String },
    coverImageUrl: { type: String },
    blocks: { type: [blockSchema], default: [] },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

postSchema.index({ site: 1, slug: 1 }, { unique: true });

export default mongoose.model('Post', postSchema);
