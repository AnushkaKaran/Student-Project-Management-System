const {
  getAll,
  getById,
  insert,
  update,
  del,
} = require("../models/projectGroupMember.model");

async function getAllGroupMembers() {
  const data = await getAll();
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching group members" };
}

async function getGroupMemberById(id) {
  const data = await getById(id);
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching group member" };
}

async function insertGroupMember(formData) {
  const data = await insert(formData);
  return data
    ? { error: false, data, message: "Inserted successfully" }
    : { error: true, message: "Error inserting group member" };
}

async function updateGroupMemberById(id, formData) {
  const data = await update(id, formData);
  return data
    ? { error: false, data, message: "Updated successfully" }
    : { error: true, message: "Error updating group member" };
}

async function deleteGroupMemberById(id) {
  const data = await del(id);
  return data
    ? { error: false, data, message: "Deleted successfully" }
    : { error: true, message: "Error deleting group member" };
}

module.exports = {
  getAllGroupMembers,
  getGroupMemberById,
  insertGroupMember,
  updateGroupMemberById,
  deleteGroupMemberById,
};
