const mongoose = require("mongoose");

const versionHistorySchema = new mongoose.Schema({
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
