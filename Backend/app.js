const express = require('express');
const cors = require("cors");
const path = require("path");
require('dotenv').config();
require("./connection/conn");   // Import MongoDB connection

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// import Routes
const User = require("./routes/user");

// Use the routes from user.js
app.use("/api/user", User);

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
