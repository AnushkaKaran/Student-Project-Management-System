const {
  getAll,
  getById,
  insert,
  update,
  del,
} = require("../models/student.model");

async function getAllStudents() {
  const data = await getAll();
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching students" };
}

async function getStudentById(id) {
  const data = await getById(id);
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching student" };
}

async function insertStudent(formData) {
  const data = await insert(formData);
  return data
    ? { error: false, data, message: "Inserted successfully" }
    : { error: true, message: "Error inserting student" };
}

async function updateStudentById(id, formData) {
  const data = await update(id, formData);
  return data
    ? { error: false, data, message: "Updated successfully" }
    : { error: true, message: "Error updating student" };
}

async function deleteStudentById(id) {
  const data = await del(id);
  return data
    ? { error: false, data, message: "Deleted successfully" }
    : { error: true, message: "Error deleting student" };
}

module.exports = {
  getAllStudents,
  getStudentById,
  insertStudent,
  updateStudentById,
  deleteStudentById,
};
