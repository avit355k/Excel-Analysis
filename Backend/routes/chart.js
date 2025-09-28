const express = require("express");
const router = express.Router();
const { authenticateToken } = require("./userAuth");
const chartController = require("../controllers/chartController");

router.post("/create", authenticateToken, chartController.createChart);
router.get("/my-charts", authenticateToken, chartController.getUserCharts);
router.get("/:id", authenticateToken, chartController.getChartById);

module.exports = router;
