const ExcelFile = require("../models/ExcelFile");
const Analysis = require("../models/Analysis");

// ========================
// GENERATE CHART DATA
// ========================
const generateChartData = async (req, res) => {
  try {
    const { fileId, sheetName, xAxis, yAxis, chartType, chartConfig } = req.body;

    if (!fileId || !sheetName || !xAxis || !chartType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const file = await ExcelFile.findOne({
      _id: fileId,
      uploadedBy: req.user._id,
    });

    if (!file) return res.status(404).json({ message: "File not found" });

    const sheet = file.sheets.find((s) => s.name === sheetName);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    const xIndex = sheet.headers.indexOf(xAxis);
    const yIndex = yAxis ? sheet.headers.indexOf(yAxis) : -1;

    if (xIndex === -1)
      return res.status(400).json({ message: "Invalid X-axis selection" });

    if (yAxis && yIndex === -1)
      return res.status(400).json({ message: "Invalid Y-axis selection" });

    const processedData = [];
    const labels = [];
    const dataPoints = [];

    // ✅ handle both numeric and text values gracefully
    for (const row of sheet.data) {
      const xVal = row[xIndex];
      let yVal = yAxis ? row[yIndex] : 1;

      if (xVal === undefined || xVal === "") continue;

      // try parse numeric if applicable
      const parsedY = yAxis ? parseFloat(yVal) : 1;

      // include if valid for numeric or categorical chart
      if (!yAxis || !isNaN(parsedY)) {
        processedData.push({ x: xVal, y: parsedY });
        labels.push(String(xVal));
        dataPoints.push(parsedY);
      }
    }

    if (processedData.length === 0) {
      return res.status(400).json({
        message:
          "No valid data points found in selected columns. Try choosing another X/Y column.",
      });
    }

    let chartData = {};

    // ========================
    // Chart Type Handling
    // ========================
    switch (chartType.toLowerCase()) {
      case "pie": {
        const counts = {};
        processedData.forEach((p) => {
          counts[p.x] = (counts[p.x] || 0) + (yAxis ? p.y : 1);
        });

        chartData = {
          labels: Object.keys(counts),
          datasets: [
            {
              label: yAxis || xAxis,
              data: Object.values(counts),
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)",
                "rgba(54, 162, 235, 0.8)",
                "rgba(255, 205, 86, 0.8)",
                "rgba(75, 192, 192, 0.8)",
                "rgba(153, 102, 255, 0.8)",
                "rgba(255, 159, 64, 0.8)",
              ],
              borderWidth: 1,
            },
          ],
        };
        break;
      }

      case "scatter": {
        const validData = processedData.filter(
          (p) => !isNaN(p.x) && !isNaN(p.y)
        );
        if (validData.length === 0)
          return res.status(400).json({ message: "No numeric pairs for scatter chart." });

        chartData = {
          datasets: [
            {
              label: `${xAxis} vs ${yAxis}`,
              data: validData.map((p) => ({ x: Number(p.x), y: Number(p.y) })),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        };
        break;
      }

      default: {
        chartData = {
          labels,
          datasets: [
            {
              label: yAxis || xAxis,
              data: dataPoints,
              backgroundColor:
                chartType === "line"
                  ? "rgba(54, 162, 235, 0.2)"
                  : dataPoints.map(
                      (_, i) =>
                        `hsla(${(i * 360) / dataPoints.length}, 70%, 60%, 0.8)`
                    ),
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
              fill: chartType === "line" ? false : true,
            },
          ],
        };
      }
    }

    // Save Analysis Record
    const analysis = new Analysis({
      fileId,
      userId: req.user._id,
      chartType,
      xAxis,
      yAxis,
      sheetName,
      chartConfig: chartConfig || {},
    });
    await analysis.save();

    await ExcelFile.findByIdAndUpdate(fileId, {
      $inc: { analysisCount: 1 },
      lastAnalyzed: new Date(),
    });

    res.json({
      chartData,
      analysisId: analysis._id,
      summary: {
        totalDataPoints: processedData.length,
        xAxis,
        yAxis,
        chartType,
        validDataPoints: processedData.length,
        invalidDataPoints: sheet.data.length - processedData.length,
      },
    });
  } catch (error) {
    console.error("Chart data error:", error);
    res.status(500).json({ message: "Error generating chart data" });
  }
};


// ========================
// HISTORY
// ========================
const getAnalysisHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ userId: req.user._id })
      .populate("fileId", "originalName uploadDate")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalAnalyses = await Analysis.countDocuments({
      userId: req.user._id,
    });

    res.json({
      analyses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAnalyses / limit),
        totalAnalyses,
        hasNext: page < Math.ceil(totalAnalyses / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching analysis history:", error);
    res.status(500).json({ message: "Error fetching analysis history" });
  }
};

// ========================
// DELETE ANALYSIS
// ========================
const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.analysisId,
      userId: req.user._id,
    });

    if (!analysis)
      return res.status(404).json({ message: "Analysis not found" });

    res.json({ message: "Analysis deleted successfully" });
  } catch (error) {
    console.error("Error deleting analysis:", error);
    res.status(500).json({ message: "Error deleting analysis" });
  }
};

// ========================
// DASHBOARD STATS
// ========================
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const analysisStats = await Analysis.aggregate([
      { $match: { userId } },
      { $group: { _id: "$chartType", count: { $sum: 1 } } },
    ]);

    const recentAnalyses = await Analysis.find({ userId })
      .populate("fileId", "originalName")
      .sort({ createdAt: -1 })
      .limit(5);

    const totalAnalyses = await Analysis.countDocuments({ userId });

    res.json({
      totalAnalyses,
      chartTypeBreakdown: analysisStats,
      recentAnalyses,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

// ========================
// GENERATE INSIGHTS
// ========================
const generateInsights = async (req, res) => {
  try {
    const { fileId, sheetName } = req.body;

    if (!fileId || !sheetName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const file = await ExcelFile.findOne({
      _id: fileId,
      uploadedBy: req.user._id,
    });

    if (!file) return res.status(404).json({ message: "File not found" });

    const sheet = file.sheets.find((s) => s.name === sheetName);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    // Generate basic insights about the data
    const insights = {
      rowCount: sheet.data.length,
      columnCount: sheet.headers.length,
      headers: sheet.headers,
      numericColumns: sheet.headers.filter((header, index) => {
        // Check if column contains mostly numeric values
        const numericCount = sheet.data.reduce((count, row) => {
          return count + (!isNaN(row[index]) ? 1 : 0);
        }, 0);
        return numericCount / sheet.data.length > 0.7; // 70% threshold
      }),
      // Add more insights as needed
    };

    res.json({ insights });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ message: "Error generating insights" });
  }
};

module.exports = {
  generateChartData,
  getAnalysisHistory,
  generateInsights,
  deleteAnalysis,
  getDashboardStats,
};
