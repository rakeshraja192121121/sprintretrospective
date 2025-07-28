import mongoose from "mongoose";

const CombinedAppDataSchema = new mongoose.Schema(
  {
    versionHistoryTable: [
      {
        date: { type: String },
        name: { type: String },
        update: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.CombinedAppData ||
  mongoose.model("CombinedAppData", CombinedAppDataSchema);
