import mongoose from "mongoose";

const DescriptionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Description ||
  mongoose.model("Description", DescriptionSchema);
