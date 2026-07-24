const jwt = require("jsonwebtoken");
const {
  getAll,
  getById,
  insert,
  update,
  del,
  getByEmail,
} = require("../models/staff.model");

const SECRET_KEY = "SPMS_SECRET_KEY"; //encryt the token, same key must be used in auth.middleware.js

//LOGIN 
async function checkLogin(formData) {
  const data = await getByEmail(formData.Email);

  if (!data) {
    return { error: true, message: "Incorrect login credentials" };
  }

  if (data.Password !== formData.Password) {
    return { error: true, message: "Incorrect login credentials" };
  }

  const token = jwt.sign(  //this creates JWT token
    {
      StaffID: data.StaffID,
      StaffName: data.StaffName,
      Email: data.Email,
    },
    SECRET_KEY,
    { expiresIn: "1h" },
  );

  return {
    error: false,
    token: token,
    message: "Login successful",
  };
}


async function getAllStaff() {
  const data = await getAll();
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching staff" };
}


async function getStaffById(id) {
  const data = await getById(id);
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching staff" };
}


async function insertStaff(formData) {
  const data = await insert(formData);
  return data
    ? { error: false, data, message: "Inserted successfully" }
    : { error: true, message: "Error inserting staff" };
}

async function updateStaffById(id, formData) {
  const data = await update(id, formData);
  return data
    ? { error: false, data, message: "Updated successfully" }
    : { error: true, message: "Error updating staff" };
}

async function deleteStaffById(id) {
  const data = await del(id);
  return data
    ? { error: false, data, message: "Deleted successfully" }
    : { error: true, message: "Error deleting staff" };
}

module.exports = {
  checkLogin,
  getAllStaff,
  getStaffById,
  insertStaff,
  updateStaffById,
  deleteStaffById,
};
