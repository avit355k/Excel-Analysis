const Chart = require("../model/Chart");

exports.createChart = async (req, res) => {
  try {
    const { fileId, chartType, xAxisKey, yAxisKeys, sheetName, chartConfig } = req.body;

    const newChart = new Chart({
      user: req.user.id,
      file: fileId,
      chartType,
      xAxisKey,
      yAxisKeys,
      sheetName,
      chartConfig
    });

    await newChart.save();
    res.status(201).json({ message: "Chart created", chart: newChart });
  } catch (err) {
    console.error("Chart creation error:", err);
    res.status(500).json({ message: "Error creating chart" });
  }
};

exports.getUserCharts = async (req, res) => {
  try {
    const charts = await Chart.find({ user: req.user.id }).populate("file");
    res.json(charts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching charts" });
  }
};

exports.getChartById = async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id).populate("file user");
    if (!chart) return res.status(404).json({ message: "Chart not found" });
    res.json(chart);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chart" });
  }
};
