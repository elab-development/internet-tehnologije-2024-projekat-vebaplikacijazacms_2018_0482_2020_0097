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

blockSchema.add({ children: [blockSchema] });

const pageSchema = new Schema(
  {
    site: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      index: true,
      required: true,
    },
    title: { type: String, required: true, trim: true },
    path: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\/[a-z0-9\-\/]*$/i.test(v),
        message:
          "Path mora počinjati sa '/' i sadržati samo slova, brojeve, '-' i '/'.",
      },
    },
    blocks: { type: [blockSchema], default: [] },
    seo: {
      title: String,
      description: String,
      ogImageUrl: String,
    },
    isDraft: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Jedinstven path po sajtu
pageSchema.index({ site: 1, path: 1 }, { unique: true });

export default mongoose.model('Page', pageSchema);
