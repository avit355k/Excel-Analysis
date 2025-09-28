const Analytics = require("../model/Analytics");
const analyticsService = require("../services/analyticsService");

// Manual: Create analytics entry
exports.createAnalytics = async (req, res) => {
  try {
    const { fileId, analysisType, results, metadata } = req.body;

    const newAnalytics = new Analytics({
      user: req.user.id,
      file: fileId,
      analysisType,
      results,
      metadata
    });

    await newAnalytics.save();
    res.status(201).json({ message: "Analytics created", analytics: newAnalytics });
  } catch (err) {
    console.error("Analytics creation error:", err);
    res.status(500).json({ message: "Error creating analytics" });
  }
};

// Manual: Get all analytics for logged-in user
exports.getUserAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.find({ user: req.user.id }).populate("file");
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
};

// Manual: Get single analytics by ID
exports.getAnalyticsById = async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id).populate("file user");
    if (!analytics) return res.status(404).json({ message: "Analytics not found" });
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
};

// AI: Analyze JSON data
exports.aiAnalyze = async (req, res) => {
  try {
    const { jsonData, metadata } = req.body;
    if (!jsonData) return res.status(400).json({ message: "No data provided" });

    const analysisResults = await analyticsService.analyzeData(jsonData, metadata);
    const aiInsights = await analyticsService.generateInsights(analysisResults, metadata);

    res.status(200).json({ analysisResults, aiInsights });
  } catch (err) {
    console.error("AI analysis error:", err);
    res.status(500).json({ message: "Error running AI analytics" });
  }
};

// AI: Test Gemini connection
exports.testGemini = async (req, res) => {
  try {
    const result = await analyticsService.geminiService.testConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Gemini test failed", error: err.message });
  }
};
