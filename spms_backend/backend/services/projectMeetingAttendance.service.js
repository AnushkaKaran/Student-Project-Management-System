const {
  getAll,
  getById,
  insert,
  update,
  del,
} = require("../models/projectMeetingAttendance.model");

async function getAllAttendance() {
  const data = await getAll();
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching attendance records" };
}

async function getAttendanceById(id) {
  const data = await getById(id);
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching attendance record" };
}

async function insertAttendance(formData) {
  const data = await insert(formData);
  return data
    ? { error: false, data, message: "Inserted successfully" }
    : { error: true, message: "Error inserting attendance record" };
}

async function updateAttendanceById(id, formData) {
  const data = await update(id, formData);
  return data
    ? { error: false, data, message: "Updated successfully" }
    : { error: true, message: "Error updating attendance record" };
}

async function deleteAttendanceById(id) {
  const data = await del(id);
  return data
    ? { error: false, data, message: "Deleted successfully" }
    : { error: true, message: "Error deleting attendance record" };
}

module.exports = {
  getAllAttendance,
  getAttendanceById,
  insertAttendance,
  updateAttendanceById,
  deleteAttendanceById,
};
