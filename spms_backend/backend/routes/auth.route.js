const express = require("express");
const { loginUser } = require("../services/auth.service");

const routeAuth = express.Router();

// POST /api/auth/login
routeAuth.post("/login", async (req, res) => {
  try {
    const result = await loginUser(req.body);
    if (result.error) {
      return res.status(401).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

module.exports = routeAuth;
