const jwt = require("jsonwebtoken");
const StaffModel = require("../models/staff.model");
const StudentModel = require("../models/student.model");

const SECRET_KEY = "SPMS_SECRET_KEY";

async function loginUser({ Email, Password, Role }) {

  if (!Email || !Password || !Role) {
    return { error: true, message: "Email, Password, and Role are required" };
  }

  let user;

  console.log("Email received:", Email);
  console.log("Role received:", Role);

  // Student Login
  if (Role === "Student") {

    user = await StudentModel.getByEmail(Email);

    if (!user) {
      return { error: true, message: "Student not found" };
    }

    if (user.Password !== Password) {
      return { error: true, message: "Password incorrect" };
    }

  } 
  
  // Faculty / Admin Login
  else {

    user = await StaffModel.getByEmail(Email);

    if (!user) {
      return { error: true, message: "Staff not found" };
    }

    if (user.Password !== Password) {
      return { error: true, message: "Password incorrect" };
    }

    // Check role match
    if (user.Role !== Role) {
      return { error: true, message: "Role mismatch" };
    }

  }

  // Create JWT payload
  const payload =
    Role === "Student"
      ? {
          UserID: user.StudentID,
          UserName: user.StudentName,
          Email: user.Email,
          Role: "Student",
        }
      : {
          UserID: user.StaffID,
          UserName: user.StaffName,
          Email: user.Email,
          Role: user.Role,
        };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

  return {
    error: false,
    token,
    user: payload,
    message: "Login successful",
  };
}

module.exports = { loginUser };