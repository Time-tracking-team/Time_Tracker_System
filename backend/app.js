const express = require("express");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const projectRoutes = require("./routes/projectRoutes");
const timeentryRoutes = require("./routes/timeentryRoutes");
const pool = require("./database/db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// API Routes
app.use("/users", userRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/projects", projectRoutes);
app.use("/timeentry", timeentryRoutes);

// Serve login page at the root and trigger background DB warmup
app.get("/", (req, res) => {
    // Non-blocking database wakeup ping (wakes up scale-to-zero DB in background while page loads)
    pool.query("SELECT 1")
        .then(() => console.log("Database warmed up successfully."))
        .catch((err) => console.log("Database warmup initiated in background:", err.message));

    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
