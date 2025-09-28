const mongoose = require("mongoose");

const chartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "File"
  },
  chartType: {
    type: String,
    required: true,
    enum: ["line", "bar", "pie", "scatter", "column3d"]
  },
  xAxisKey: {
    type: String,
    required: true
  },
  yAxisKeys: [{
    type: String,
    required: true
  }],
  sheetName: {
    type: String,
    required: true
  },
  chartConfig: {
    title: String,
    backgroundColor: String,
    borderColor: String,
    borderWidth: Number
  },
  previewImage: String,
  status: {
    type: String,
    enum: ["active", "archived", "deleted"],
    default: "active"
  },
  exportedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update updatedAt
chartSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
chartSchema.index({ user: 1 });
chartSchema.index({ file: 1 });
chartSchema.index({ chartType: 1 });

module.exports = mongoose.model("Chart", chartSchema);
