const express = require("express");
const { getAllProjectGroups, getProjectGroupById, insertProjectGroup, updateProjectGroupById, deleteProjectGroupById } = require("../services/projectGroup.service");
const { authMiddleware } = require("../middleware/auth.middleware");

const routeProjectGroup = express.Router();  //router object, used to define all routes related to projectgroup

// Protect all project group routes
routeProjectGroup.use(authMiddleware);  

// Get all project groups
routeProjectGroup.get("/", async (req, res) => {
  const result = await getAllProjectGroups();
  res.send(result);
});

// Get project group by ID
routeProjectGroup.get("/:id", async (req, res) => {
  const result = await getProjectGroupById(req.params.id);
  res.send(result);
});

// Insert project group
routeProjectGroup.post("/", async (req, res) => {
  const result = await insertProjectGroup(req.body);
  res.send(result);
});

// Update project group
routeProjectGroup.patch("/:id", async (req, res) => {
  const result = await updateProjectGroupById(req.params.id, req.body);
  res.send(result);
});

// Delete project group
routeProjectGroup.delete("/:id", async (req, res) => {
  const result = await deleteProjectGroupById(req.params.id);
  res.send(result);
});

// Add members to group
routeProjectGroup.post("/:id/members", async (req, res) => {
  const { members } = req.body; // Expect an array of student IDs forming the group
  // Normally this would map to an insertMany function in projectGroupMember.service
  res.status(501).json({ message: "Members addition logic to be implemented", groupId: req.params.id });
});

// Allocate Guide
routeProjectGroup.patch("/:id/guide", async (req, res) => {
  const { guideId } = req.body;
  const result = await updateProjectGroupById(req.params.id, { GuideStaffID: guideId });
  res.send(result);
});

module.exports = routeProjectGroup;