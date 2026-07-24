const Model = require("../models/academicYear.model");

async function getAll() {
  return await Model.getAll();
}

async function getById(id) {
  return await Model.getById(id);
}

async function insert(formData) {
  return await Model.insert(formData);
}

async function update(id, formData) {
  return await Model.update(id, formData);
}

async function del(id) {
  return await Model.del(id);
}

module.exports = { getAll, getById, insert, update, del };
