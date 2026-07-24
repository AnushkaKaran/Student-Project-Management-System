const express = require("express");
const { getAllGroupMembers, getGroupMemberById, insertGroupMember, updateGroupMemberById, deleteGroupMemberById } = require("../services/projectGroupMember.service");
const { authMiddleware } = require("../middleware/auth.middleware");

const routeGroupMember = express.Router();

// Protect all group member routes
routeGroupMember.use(authMiddleware);

// Get all group members
routeGroupMember.get("/", async (req, res) => {
  const result = await getAllGroupMembers();
  res.send(result);
});

// Get group member by ID
routeGroupMember.get("/:id", async (req, res) => {
  const result = await getGroupMemberById(req.params.id);
  res.send(result);
});

// Insert group member
routeGroupMember.post("/", async (req, res) => {
  const result = await insertGroupMember(req.body);
  res.send(result);
});

// Update group member
routeGroupMember.patch("/:id", async (req, res) => {
  const result = await updateGroupMemberById(req.params.id, req.body);
  res.send(result);
});

// Delete group member
routeGroupMember.delete("/:id", async (req, res) => {
  const result = await deleteGroupMemberById(req.params.id);
  res.send(result);
});

module.exports = routeGroupMember;