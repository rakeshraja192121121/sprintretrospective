import mongoose from "mongoose";

const DescriptionSchema = new mongoose.Schema({
  userID: {
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
