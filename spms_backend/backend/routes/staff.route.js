// const express = require("express");
// const { checkLogin, getAllStaff, getStaffById, insertStaff, updateStaffById, deleteStaffById } = require("../services/staff.service");
// const { authMiddleware } = require("../middleware/auth.middleware");
// const staffService = require("../services/staff.services");

// const routeStaff = express.Router();

// // Login route (no middleware)
// routeStaff.post("/login", async (req, res) => {
//   const result = await checkLogin(req.body);
//   if (result.error) return res.status(401).send(result);
//   res.send(result);
// });

// // Protect all other staff routes
// routeStaff.use(authMiddleware);

// // Get all staff
// routeStaff.get("/", async (req, res) => {
//   const result = await getAllStaff();
//   res.send(result);
// });

// // Get staff by ID
// routeStaff.get("/:id", async (req, res) => {
//   const result = await getStaffById(req.params.id);
//   res.send(result);
// });

// // Insert staff
// routeStaff.post("/", async (req, res) => {
//   const result = await insertStaff(req.body);
//   res.send(result);
// });

// // Update staff
// routeStaff.patch("/:id", async (req, res) => {
//   const result = await updateStaffById(req.params.id, req.body);
//   res.send(result);
// });

// // Delete staff
// routeStaff.delete("/:id", async (req, res) => {
//   const result = await deleteStaffById(req.params.id);
//   res.send(result);
// });

// module.exports = routeStaff;



const express = require("express");
const {
  checkLogin,
  getAllStaff,
  getStaffById,
  insertStaff,
  updateStaffById,
  deleteStaffById
} = require("../services/staff.service");

const { authMiddleware } = require("../middleware/auth.middleware");

const routeStaff = express.Router();

// 🔓 LOGIN ROUTE (Public)
routeStaff.post("/login", async (req, res) => {
  const result = await checkLogin(req.body);

  if (result.error) {
    return res.status(401).json(result);
  }

  res.json(result);
});

// 🔐 Protect all below routes
routeStaff.use(authMiddleware);

// GET ALL STAFF
routeStaff.get("/", async (req, res) => {
  const result = await getAllStaff();
  res.json(result);
});

// GET STAFF BY ID
routeStaff.get("/:id", async (req, res) => {
  const result = await getStaffById(req.params.id);
  res.json(result);
});

// INSERT STAFF
routeStaff.post("/", async (req, res) => {
  const result = await insertStaff(req.body);
  res.json(result);
});

// UPDATE STAFF
routeStaff.patch("/:id", async (req, res) => {
  const result = await updateStaffById(req.params.id, req.body);
  res.json(result);
});

// DELETE STAFF
routeStaff.delete("/:id", async (req, res) => {
  const result = await deleteStaffById(req.params.id);
  res.json(result);
});

module.exports = routeStaff;
