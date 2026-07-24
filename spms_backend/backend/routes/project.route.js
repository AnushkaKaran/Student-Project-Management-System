const express = require("express");
const { updateProjectGroupById, insertProjectGroup } = require("../services/projectGroup.service");
const { authMiddleware } = require("../middleware/auth.middleware");

const routeProject = express.Router();

// routeProject.use(authMiddleware);

// Submit proposal
routeProject.post("/proposal", async (req, res) => {
  // A proposal is essentially a project group submission
  const result = await insertProjectGroup({ ...req.body, Status: 'Proposed' });
  res.send(result);
});

// Approve/Reject project
routeProject.patch("/:id/approval", async (req, res) => {
  const { status } = req.body; // 'Approved' or 'Rejected'
  const result = await updateProjectGroupById(req.params.id, { Status: status });
  res.send(result);
});

// Upload project documents
routeProject.post("/:id/upload", async (req, res) => {
  // Placeholder for file upload logic (e.g. using multer)
  res.status(501).json({ message: "File upload logic to be implemented", projectId: req.params.id });
});

module.exports = routeProject;
