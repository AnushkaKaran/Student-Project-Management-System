const db = require("../db/mysql");

// Get all attendance records
async function getAll() {
  try {
    const [data] = await db.query("SELECT * FROM ProjectMeetingAttendance");
    return data;
  } catch (error) {
    return false;
  }
}

// Get attendance by ID
async function getById(id) {
  try {
    const [data] = await db.query(`SELECT * FROM ProjectMeetingAttendance WHERE ProjectMeetingAttendanceID=${id}`);
    return data[0];
  } catch (error) {
    return false;
  }
}

// Insert attendance record
async function insert(formData) {
  try {
    const query = `INSERT INTO ProjectMeetingAttendance 
      (ProjectMeetingID, StudentID, IsPresent, AttendanceRemarks, Description, Created, Modified)
      VALUES ('${formData.ProjectMeetingID}', '${formData.StudentID}', '${formData.IsPresent}', '${formData.AttendanceRemarks}', '${formData.Description}', NOW(), NOW())`;
    const [data] = await db.query(query);
    return data;
  } catch (error) {
    return false;
  }
}

// Update attendance record
async function update(id, formData) {
  try {
    const query = `
      UPDATE ProjectMeetingAttendance 
      SET 
        ProjectMeetingID = IFNULL(${formData.ProjectMeetingID ?? null}, ProjectMeetingID),
        StudentID = IFNULL(${formData.StudentID ?? null}, StudentID),
        IsPresent = IFNULL(${formData.IsPresent ?? null}, IsPresent),
        AttendanceRemarks = IFNULL(${formData.AttendanceRemarks ? `'${formData.AttendanceRemarks}'` : null}, AttendanceRemarks),
        Description = IFNULL(${formData.Description ? `'${formData.Description}'` : null}, Description),
        Modified = NOW()
      WHERE ProjectMeetingAttendanceID = ${id}
    `;
    
    const [data] = await db.query(query);
    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}



// Delete attendance record
async function del(id) {
  try {
    const [data] = await db.query(`DELETE FROM ProjectMeetingAttendance WHERE ProjectMeetingAttendanceID=${id}`);
    return data;
  } catch (error) {
    return false;
  }
}

module.exports = { getAll, getById, insert, update, del };