const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: Number,
  fileType: {
    type: String,
    enum: ["xlsx", "xls", "csv"],
  },
  parsedData: {
    type: Array,
    default: [], // store preview rows only
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

fileSchema.index({ uploadedBy: 1, uploadDate: -1 });

module.exports = mongoose.model("File", fileSchema);
