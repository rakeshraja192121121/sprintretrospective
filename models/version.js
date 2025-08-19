import mongoose from "mongoose";

const versionHistorySchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "workspace",
    required: true,
  },
  date: {
    type: String,
  },
  name: {
    type: String,
  },
  update: {
    type: String,
  },
});
const versionModel =
  mongoose.models.VersionHistory ||
  mongoose.model("VersionHistory", versionHistorySchema);

export default versionModel;
