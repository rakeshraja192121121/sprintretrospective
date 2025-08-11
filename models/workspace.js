import mongoose from "mongoose";

const workspaceSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

const workspaceModel =
  mongoose.models.workspace || mongoose.model("workspace", workspaceSchema);

export default workspaceModel;
