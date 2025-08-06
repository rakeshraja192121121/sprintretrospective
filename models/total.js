import mongoose from "mongoose";

const versionEntrySchema = new mongoose.Schema({
  _id: String,
  date: String,
  name: String,
  update: String,
});

const descriptionSchema = new mongoose.Schema({
  _id: String,
  content: String,
  createdAt: String,
});

const versionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    versionHistory: [versionEntrySchema],
    description: [descriptionSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Version ||
  mongoose.model("Version", versionSchema);
