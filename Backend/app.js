const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const multer = require("multer")
const path = require("path")

// Import routes
const authRoutes = require("./routes/auth")
const fileRoutes = require("./routes/files")
const analyticsRoutes = require("./routes/analytics")
const adminRoutes = require("./routes/admin")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 500;

// Middleware
//https://excelanalyticsplatform.netlify.app/
const allowedOrigins = [
  'http://localhost:5173',
  'https://excelanalyticsplatform.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/excel-analytics", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/files", fileRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/admin", adminRoutes)

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).json({ message: "Something went wrong!" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
