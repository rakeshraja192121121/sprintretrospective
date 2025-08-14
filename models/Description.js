import mongoose from "mongoose";
import workspace from "./workspace";

const DescriptionSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "workspace",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Description ||
  mongoose.model("Description", DescriptionSchema);
