import mongoose from "mongoose";

const DataSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["well", "improve", "action"], // optional, but good for validation
    },
  },
  {
    timestamps: true,
  }
);

const Data = mongoose.models.Data || mongoose.model("Data", DataSchema);

export default Data;
