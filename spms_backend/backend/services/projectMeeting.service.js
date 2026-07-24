const {
  getAll,
  getById,
  insert,
  update,
  del,
  getByGroupId,
} = require("../models/projectMeeting.model");

async function getAllMeetings() {
  const data = await getAll();
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching meetings" };
}

async function getMeetingById(id) {
  const data = await getById(id);
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching meeting" };
}

async function insertMeeting(formData) {
  const data = await insert(formData);
  return data
    ? { error: false, data, message: "Inserted successfully" }
    : { error: true, message: "Error inserting meeting" };
}

async function updateMeetingById(id, formData) {
  const data = await update(id, formData);
  return data
    ? { error: false, data, message: "Updated successfully" }
    : { error: true, message: "Error updating meeting" };
}

async function deleteMeetingById(id) {
  const data = await del(id);
  return data
    ? { error: false, data, message: "Deleted successfully" }
    : { error: true, message: "Error deleting meeting" };
}

async function getMeetingsByGroupId(groupId) {
  const data = await getByGroupId(groupId);
  return data
    ? { error: false, data, message: "Fetched successfully" }
    : { error: true, message: "Error fetching meetings for group" };
}

module.exports = {
  getAllMeetings,
  getMeetingById,
  insertMeeting,
  updateMeetingById,
  deleteMeetingById,
  getMeetingsByGroupId,
};
