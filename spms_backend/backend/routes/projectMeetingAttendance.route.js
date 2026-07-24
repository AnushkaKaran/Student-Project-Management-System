const express = require("express");
const { getAllAttendance, getAttendanceById, insertAttendance, updateAttendanceById, deleteAttendanceById } = require("../services/projectMeetingAttendance.service");
const { authMiddleware } = require("../middleware/auth.middleware");

const routeAttendance = express.Router();

// Protect all attendance routes
routeAttendance.use(authMiddleware);

// Get all attendance records
routeAttendance.get("/", async (req, res) => {
  const result = await getAllAttendance();
  res.send(result);
});

// Get attendance record by ID
routeAttendance.get("/:id", async (req, res) => {
  const result = await getAttendanceById(req.params.id);
  res.send(result);
});

// Insert attendance record
routeAttendance.post("/", async (req, res) => {
  const result = await insertAttendance(req.body);
  res.send(result);
});

// Update attendance record
routeAttendance.patch("/:id", async (req, res) => {
  const result = await updateAttendanceById(req.params.id, req.body);
  res.send(result);
});

// Delete attendance record
routeAttendance.delete("/:id", async (req, res) => {
  const result = await deleteAttendanceById(req.params.id);
  res.send(result);
});

module.exports = routeAttendance;