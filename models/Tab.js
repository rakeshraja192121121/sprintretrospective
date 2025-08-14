import mongoose from "mongoose";

const TabSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true },
    label: { type: String, required: true },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

// Use existing model if it exists, or create a new one
const Tab = mongoose.models.Tab || mongoose.model("Tab", TabSchema);

export default Tab;
