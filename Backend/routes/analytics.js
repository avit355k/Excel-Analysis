const express = require("express");
const router = express.Router();
const { authenticateToken } = require("./userAuth");
const analyticsController = require("../controllers/analyticsController");

// Manual analytics routes
router.post("/create", authenticateToken, analyticsController.createAnalytics);
router.get("/my-analytics", authenticateToken, analyticsController.getUserAnalytics);
router.get("/:id", authenticateToken, analyticsController.getAnalyticsById);

// AI-powered analytics routes
router.post("/ai-analyze", authenticateToken, analyticsController.aiAnalyze);
router.get("/test-gemini", authenticateToken, analyticsController.testGemini);

module.exports = router;
