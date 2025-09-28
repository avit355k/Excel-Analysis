const express = require("express");
const router = express.Router();
const { authenticateToken } = require("./userAuth");
const reportController = require("../controllers/reportController");

router.post("/create", authenticateToken, reportController.createReport);
router.get("/my-reports", authenticateToken, reportController.getUserReports);
router.get("/:id", authenticateToken, reportController.getReportById);

module.exports = router;
