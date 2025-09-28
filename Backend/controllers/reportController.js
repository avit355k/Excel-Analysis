const Report = require("../model/Report");
const File = require("../model/File");
const Analytics = require("../model/Analytics");
const GeminiService = require("../services/geminiService");

const geminiService = new GeminiService();

/**
 * Create Report (manual or AI-powered)
 */
exports.createReport = async (req, res) => {
  try {
    const { fileId, analyticsId, template = "detailed", content, metadata, useAI = false } = req.body;

    // Validate file exists
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Validate analytics exists
    const analytics = await Analytics.findById(analyticsId);
    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found" });
    }

    let reportContent = content;

    // If user requests AI report via Gemini
    if (useAI) {
      if (!geminiService.isEnabled) {
        return res.status(400).json({ message: "Gemini AI not configured" });
      }
      const aiReport = await geminiService.generateBusinessReport(
        analytics.results,
        metadata || {},
        template
      );
      reportContent = aiReport;
    }

    // Save to DB
    const newReport = new Report({
      user: req.user.id,
      file: fileId,
      analytics: analyticsId,
      template,
      content: reportContent,
      metadata
    });

    await newReport.save();

    res.status(201).json({
      message: useAI ? "AI Report generated successfully" : "Report created successfully",
      report: newReport
    });
  } catch (err) {
    console.error("Report creation error:", err);
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
};

/**
 * Get all reports of logged-in user
 */
exports.getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .populate("file analytics");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reports", error: err.message });
  }
};

/**
 * Get single report by ID
 */
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("file analytics user");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Error fetching report", error: err.message });
  }
};
