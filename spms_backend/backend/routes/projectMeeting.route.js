const express = require("express");
const { getAllMeetings, getMeetingById, insertMeeting, updateMeetingById, deleteMeetingById, getMeetingsByGroupId } = require("../services/projectMeeting.service");
const { authMiddleware } = require("../middleware/auth.middleware");

const routeMeeting = express.Router();

// Protect all meeting routes
routeMeeting.use(authMiddleware);

// Get all meetings
routeMeeting.get("/", async (req, res) => {
  const result = await getAllMeetings();
  res.send(result);
});

// Get meeting by ID
routeMeeting.get("/:id", async (req, res) => {
  const result = await getMeetingById(req.params.id);
  res.send(result);
});

// Get meetings by Group ID
routeMeeting.get("/group/:groupId", async (req, res) => {
  const result = await getMeetingsByGroupId(req.params.groupId);
  res.send(result);
});

// Insert meeting
routeMeeting.post("/", async (req, res) => {
  const result = await insertMeeting(req.body);
  res.send(result);
});

// Update meeting
routeMeeting.patch("/:id", async (req, res) => {
  const result = await updateMeetingById(req.params.id, req.body);
  res.send(result);
});

// Delete meeting
routeMeeting.delete("/:id", async (req, res) => {
  const result = await deleteMeetingById(req.params.id);
  res.send(result);
});


//Extra 
// Get meetings eligible for entry
routeMeeting.get("/entry", async (req, res) => {
  const { getPendingEntries } = require("../models/project.model");
  try {
    const meetings = await getPendingEntries();
    res.json({ error: false, data: meetings });
  } catch (err) {
    res.status(500).json({ error: true, message: "Failed to fetch meetings" });
  }
});

// projectMeeting.route.js
routeMeeting.get("/pending", async (req, res) => {
  const data = await getPendingEntries();
  res.json({ data });
});

module.exports = routeMeeting;