import mongoose from "mongoose";

const workspaceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspace",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "inprogress", "done"],
      default: "new",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const workspaceModel =
  mongoose.models.workspace || mongoose.model("workspace", workspaceSchema);

export default workspaceModel;
