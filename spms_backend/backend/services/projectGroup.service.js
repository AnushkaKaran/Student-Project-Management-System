const {
  getAll,
  getById,
  insert,
  update,
  del,
} = require("../models/projectGroup.model");

async function getAllProjectGroups() {
  const data = await getAll();
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching project groups" };
}

async function getProjectGroupById(id) {
  const data = await getById(id);
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching project group" };
}

async function insertProjectGroup(formData) {
  const data = await insert(formData);
  return data
    ? { error: false, data, message: "Inserted successfully" }
    : { error: true, message: "Error inserting project group" };
}

async function updateProjectGroupById(id, formData) {
  const data = await update(id, formData);
  return data
    ? { error: false, data, message: "Updated successfully" }
    : { error: true, message: "Error updating project group" };
}

async function deleteProjectGroupById(id) {
  const data = await del(id);
  return data
    ? { error: false, data, message: "Deleted successfully" }
    : { error: true, message: "Error deleting project group" };
}

module.exports = {
  getAllProjectGroups,
  getProjectGroupById,
  insertProjectGroup,
  updateProjectGroupById,
  deleteProjectGroupById,
};
