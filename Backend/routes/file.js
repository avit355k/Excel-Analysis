const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authenticateToken } = require("./userAuth");
const fileController = require("../controllers/fileController");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes
router.post("/upload", authenticateToken, upload.single("file"), fileController.uploadFile);
router.get("/my-uploads", authenticateToken, fileController.getMyUploads);
router.get("/:id", authenticateToken, fileController.getFileById);

module.exports = router;
