const express = require("express");
const { getAllStudents, getStudentById, insertStudent, updateStudentById, deleteStudentById } = require("../services/student.service.js");
const { authMiddleware } = require("../middleware/auth.middleware");

const routeStudent = express.Router();

routeStudent.use(authMiddleware);

// Get all students
routeStudent.get("/", async (req, res) => {
  const result = await getAllStudents();
  res.send(result);
});

// Get student by ID
routeStudent.get("/:id", async (req, res) => {
  const result = await getStudentById(req.params.id);
  res.send(result);
});

// Insert student
routeStudent.post("/", async (req, res) => {
  const result = await insertStudent(req.body);
  res.send(result);
});

// Update student
routeStudent.patch("/:id", async (req, res) => {
  // console.log("Student data received:", req.body);
  const result = await updateStudentById(req.params.id, req.body);
  res.send(result);
});

// Delete student
routeStudent.delete("/:id", async (req, res) => {
  const result = await deleteStudentById(req.params.id);
  res.send(result);
});

module.exports = routeStudent;