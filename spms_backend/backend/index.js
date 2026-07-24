const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const studentRoutes = require("./routes/student.route");
const staffRoutes = require("./routes/staff.route");
const projectGroupRoutes = require("./routes/projectGroup.route");
const projectGroupMemberRoutes = require("./routes/projectGroupMember.route");
const projectMeetingRoutes = require("./routes/projectMeeting.route");
const projectMeetingAttendanceRoutes = require("./routes/projectMeetingAttendance.route");
const projectTypeRoutes = require("./routes/projectType.route");
const academicYearRoutes = require("./routes/academicYear.route");
const authRoutes = require("./routes/auth.route");
const projectRoutes = require("./routes/project.route");

const app = express();
app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/students", studentRoutes);
app.use("/api/master/staff", staffRoutes);
app.use("/api/groups", projectGroupRoutes);
app.use("/api/project-group-members", projectGroupMemberRoutes);
app.use("/api/meetings", projectMeetingRoutes);
app.use("/api/project-meeting-attendance", projectMeetingAttendanceRoutes);
app.use("/api/master/project-types", projectTypeRoutes);
app.use("/api/master/academic-years", academicYearRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));