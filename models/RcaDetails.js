import mongoose from "mongoose";

const RCADetailsSchema = new mongoose.Schema(
  {
    cardID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RCAcard",
      required: true,
    },
    whatHappened: { type: String, default: "" },
    impact: { type: String, default: "" },
    timeline: { type: String, default: "" },
    rootCause: { type: String, default: "" },
    nextSteps: { type: String, default: "" },
    Attendees: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.RCADetails ||
  mongoose.model("RCADetails", RCADetailsSchema);
