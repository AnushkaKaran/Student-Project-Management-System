const db = require("../db/mysql");

// Get all project types
async function getAll() {
  try {
    const [data] = await db.query("SELECT * FROM ProjectType");
    return data;
  } catch (error) {
    return false;
  }
}

// Get project type by ID
async function getById(id) {
  try {
    const [data] = await db.query(`SELECT * FROM ProjectType WHERE ProjectTypeID=${id}`);
    return data[0];
  } catch (error) {
    return false;
  }
}

// Insert project type
async function insert(formData) {
  try {
    const query = `INSERT INTO ProjectType 
      (ProjectTypeName, Description, Created, Modified)
      VALUES ('${formData.ProjectTypeName}', '${formData.Description}', NOW(), NOW())`;
    const [data] = await db.query(query);
    return data;
  } catch (error) {
    return false;
  }
}

// Update project type
async function update(id, formData) {
  try {
    const query = `
      UPDATE ProjectType SET
        ProjectTypeName = IFNULL(${formData.ProjectTypeName ? `'${formData.ProjectTypeName}'` : null}, ProjectTypeName),
        Description = IFNULL(${formData.Description ? `'${formData.Description}'` : null}, Description),
        Modified = NOW()
      WHERE ProjectTypeID = ${id}
    `;

    const [data] = await db.query(query);
    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}


// Delete project type
async function del(id) {
  try {
    const [data] = await db.query(`DELETE FROM ProjectType WHERE ProjectTypeID=${id}`);
    return data;
  } catch (error) {
    return false;
  }
}

module.exports = { getAll, getById, insert, update, del };