const express = require("express");
const router = express.Router();
const Service = require("../services/academicYear.service");

// Get all
router.get("/", async (req, res) => {
  const result = await Service.getAll();
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(500).json({ message: "Failed to fetch academic years" });
  }
});

// Get by ID
router.get("/:id", async (req, res) => {
  const result = await Service.getById(req.params.id);
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(404).json({ message: "Academic year not found" });
  }
});

// Insert
router.post("/", async (req, res) => {
  const result = await Service.insert(req.body);
  if (result) {
    res.status(201).json({ message: "Academic year created successfully" });
  } else {
    res.status(500).json({ message: "Failed to create academic year" });
  }
});

// Update
router.patch("/:id", async (req, res) => {
  const result = await Service.update(req.params.id, req.body);
  if (result) {
    res.status(200).json({ message: "Academic year updated successfully" });
  } else {
    res.status(500).json({ message: "Failed to update academic year" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  const result = await Service.del(req.params.id);
  if (result) {
    res.status(200).json({ message: "Academic year deleted successfully" });
  } else {
    res.status(500).json({ message: "Failed to delete academic year" });
  }
});

module.exports = router;
