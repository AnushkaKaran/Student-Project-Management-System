const {
  getAll,
  getById,
  insert,
  update,
  del,
} = require("../models/projectType.model");

async function getAllProjectTypes() {
  const data = await getAll();
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching project types" };
}

async function getProjectTypeById(id) {
  const data = await getById(id);
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching project type" };
}

async function insertProjectType(formData) {
  const data = await insert(formData);
  return data
    ? { error: false, data, message: "Inserted successfully" }
    : { error: true, message: "Error inserting project type" };
}

async function updateProjectTypeById(id, formData) {
  const data = await update(id, formData);
  return data
    ? { error: false, data, message: "Updated successfully" }
    : { error: true, message: "Error updating project type" };
}

async function deleteProjectTypeById(id) {
  const data = await del(id);
  return data
    ? { error: false, data, message: "Deleted successfully" }
    : { error: true, message: "Error deleting project type" };
}

module.exports = {
  getAllProjectTypes,
  getProjectTypeById,
  insertProjectType,
  updateProjectTypeById,
  deleteProjectTypeById,
};
