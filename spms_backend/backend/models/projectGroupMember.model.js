const db = require("../db/mysql");

// Get all group members
async function getAll() {
  try {
    const [data] = await db.query("SELECT * FROM ProjectGroupMember");
    return data;
  } catch (error) {
    return false;
  }
}

// Get group member by ID
async function getById(id) {
  try {
    const [data] = await db.query(`SELECT * FROM ProjectGroupMember WHERE ProjectGroupMemberID=${id}`);
    return data[0];
  } catch (error) {
    return false;
  }
}

// Insert group member
async function insert(formData) {
  try {
    const query = `INSERT INTO ProjectGroupMember 
      (ProjectGroupID, StudentID, IsGroupLeader, StudentCGPA, Description, Created, Modified)
      VALUES ('${formData.ProjectGroupID}', '${formData.StudentID}', '${formData.IsGroupLeader}', '${formData.StudentCGPA}', '${formData.Description}', NOW(), NOW())`;
    const [data] = await db.query(query);
    return data;
  } catch (error) {
    return false;
  }
}

// Update group member
async function update(id, formData) {
  try {
    const query = `
      UPDATE ProjectGroupMember SET

      ProjectGroupID =
      IFNULL(
        ${formData.ProjectGroupID ?? null},
        ProjectGroupID
      ),

      StudentID =
      IFNULL(
        ${formData.StudentID ?? null},
        StudentID
      ),

      IsGroupLeader =
      IFNULL(
        ${formData.IsGroupLeader ?? null},
        IsGroupLeader
      ),

      StudentCGPA =
      IFNULL(
        ${formData.StudentCGPA ?? null},
        StudentCGPA
      ),

      Description =
      IFNULL(
        ${formData.Description ? `'${formData.Description}'` : null},
        Description
      ),

      Modified = NOW()

      WHERE ProjectGroupMemberID = ${id}
    `;

    const [data] = await db.query(query);
    return data;

  } catch (error) {
    console.log(error);
    return false;
  }
}


// Delete group member
async function del(id) {
  try {
    const [data] = await db.query(`DELETE FROM ProjectGroupMember WHERE ProjectGroupMemberID=${id}`);
    return data;
  } catch (error) {
    return false;
  }
}

module.exports = { getAll, getById, insert, update, del };