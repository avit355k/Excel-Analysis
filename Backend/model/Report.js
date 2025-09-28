const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  file: {
    type: Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },
  analytics: {
    type: Schema.Types.ObjectId,
    ref: "Analytics",
  },
  template: {
    type: String,
    enum: ["executive", "detailed", "comparative", "custom"],
    required: true,
    default: "detailed",
  },
  content: {
    title: String,
    executive_summary: String,
    key_findings: [String],
    detailed_analysis: String,
    recommendations: [String],
    methodology: String,
    conclusion: String,
    visualizations: [{
      type: String, // 'chart', 'table', 'heatmap', etc.
      title: String,
      data: Schema.Types.Mixed,
      config: Schema.Types.Mixed,
      position: Number
    }],
    sections: [{
      title: String,
      content: String,
      order: Number,
      type: String // 'text', 'chart', 'table'
    }]
  },
  metadata: {
    wordCount: Number,
    pageCount: Number,
    generationTime: Number,
    aiModel: String,
    version: String,
    language: { type: String, default: "en" },
    tone: {
      type: String,
      enum: ["professional", "casual", "technical", "executive"],
      default: "professional",
    }
  },
  exports: [{
    format: String, // 'pdf', 'docx', 'pptx', 'html'
    filePath: String,
    fileName: String,
    generatedAt: Date,
    fileSize: Number,
    downloadCount: { type: Number, default: 0 }
  }],
  sharing: {
    isShared: { type: Boolean, default: false },
    shareToken: String,
    shareExpiry: Date,
    allowedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  status: {
    type: String,
    enum: ["generating", "completed", "failed", "archived"],
    default: "generating",
  },
  error: {
    message: String,
    stack: String,
    timestamp: Date,
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    feedback: String,
    ratedAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt
reportSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ template: 1 });
reportSchema.index({ "sharing.shareToken": 1 });

module.exports = mongoose.model("Report", reportSchema);
