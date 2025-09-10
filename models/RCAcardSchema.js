import mongoose from "mongoose";

const RCAcardSchema = new mongoose.Schema({
  epicName: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RCAcardSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.RCAcard ||
  mongoose.model("RCAcard", RCAcardSchema);
