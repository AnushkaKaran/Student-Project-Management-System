const express = require("express");
const { getAllProjectTypes, getProjectTypeById, insertProjectType, updateProjectTypeById, deleteProjectTypeById } = require("../services/projectType.service");
const { authMiddleware } = require("../middleware/auth.middleware");

const routeProjectType = express.Router();

// Protect all project type routes
routeProjectType.use(authMiddleware);

// Get all project types
routeProjectType.get("/", async (req, res) => {
  const result = await getAllProjectTypes();
  res.send(result);
});

// Get project type by ID
routeProjectType.get("/:id", async (req, res) => {
  const result = await getProjectTypeById(req.params.id);
  res.send(result);
});

// Insert project type
routeProjectType.post("/", async (req, res) => {
  const result = await insertProjectType(req.body);
  res.send(result);
});

// Update project type
routeProjectType.patch("/:id", async (req, res) => {
  const result = await updateProjectTypeById(req.params.id, req.body);
  res.send(result);
});

// Delete project type
routeProjectType.delete("/:id", async (req, res) => {
  const result = await deleteProjectTypeById(req.params.id);
  res.send(result);
});

module.exports = routeProjectType;