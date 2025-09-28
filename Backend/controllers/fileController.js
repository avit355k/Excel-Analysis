const xlsx = require("xlsx");
const File = require("../model/File");
const fs = require("fs");

// Upload & parse Excel
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const newFile = new File({
      filename: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.originalname.split(".").pop(),
      parsedData: sheetData.slice(0, 10), // store only first 10 rows preview
      uploadedBy: req.user.id,
    });

    await newFile.save();

    // Optional: delete file after parsing (if not storing)
    // fs.unlinkSync(req.file.path);

    res.status(201).json({ message: "File uploaded successfully", file: newFile });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ message: "Error processing file" });
  }
};

// Get all user uploads
exports.getMyUploads = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Error fetching uploads" });
  }
};

// Get single file by ID
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate("uploadedBy", "username email");
    if (!file) return res.status(404).json({ message: "File not found" });
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: "Error fetching file" });
  }
};
