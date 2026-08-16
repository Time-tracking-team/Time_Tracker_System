const express = require("express");
const router = express.Router();

const timeentryController = require("../controllers/timeentryController");

// Create Time Entry (Must Have)
router.post("/", timeentryController.createTimeEntry);

// View/Fetch Time Entries with Search & Filter (Must Have & Should Have)
router.get("/", timeentryController.getTimeEntries);

// Reports - Personal & Team (Should Have)
router.get("/reports", timeentryController.getReports);

// Edit/Update Time Entry (Must Have)
router.put("/:id", timeentryController.updateTimeEntry);

// Delete Time Entry (Must Have)
router.delete("/:id", timeentryController.deleteTimeEntry);

module.exports = router;
