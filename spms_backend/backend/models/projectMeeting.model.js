const db = require("../db/mysql");

// Get all project meetings
async function getAll() {
  try {
    const [data] = await db.query("SELECT * FROM ProjectMeeting");
    return data;
  } catch (error) {
    return false;
  }
}

// Get meeting by ID
async function getById(id) {
  try {
    const [data] = await db.query(`SELECT * FROM ProjectMeeting WHERE ProjectMeetingID=${id}`);
    return data[0];
  } catch (error) {
    return false;
  }
}

// Insert meeting
async function insert(formData) {
  try {
    const query = `INSERT INTO ProjectMeeting 
      (ProjectGroupID, GuideStaffID, MeetingDateTime, MeetingPurpose, MeetingLocation, MeetingNotes, MeetingStatus, MeetingStatusDescription, MeetingStatusDatetime, Description, Created, Modified)
      VALUES ('${formData.ProjectGroupID}', '${formData.GuideStaffID}', '${formData.MeetingDateTime}', '${formData.MeetingPurpose}', '${formData.MeetingLocation}', '${formData.MeetingNotes}', '${formData.MeetingStatus}', '${formData.MeetingStatusDescription}', '${formData.MeetingStatusDatetime}', '${formData.Description}', NOW(), NOW())`;
    const [data] = await db.query(query);
    return data;
  } catch (error) {
    return false;
  }
}

// Update meeting
async function update(id, formData) {
  try {
    const query = `
      UPDATE ProjectMeeting SET
        ProjectGroupID = IFNULL(${formData.ProjectGroupID ?? null}, ProjectGroupID),
        GuideStaffID = IFNULL(${formData.GuideStaffID ?? null}, GuideStaffID),
        MeetingDateTime = IFNULL(${formData.MeetingDateTime ? `'${formData.MeetingDateTime}'` : null}, MeetingDateTime),
        MeetingPurpose = IFNULL(${formData.MeetingPurpose ? `'${formData.MeetingPurpose}'` : null}, MeetingPurpose),
        MeetingLocation = IFNULL(${formData.MeetingLocation ? `'${formData.MeetingLocation}'` : null}, MeetingLocation),
        MeetingNotes = IFNULL(${formData.MeetingNotes ? `'${formData.MeetingNotes}'` : null}, MeetingNotes),
        MeetingStatus = IFNULL(${formData.MeetingStatus ? `'${formData.MeetingStatus}'` : null}, MeetingStatus),
        MeetingStatusDescription = IFNULL(${formData.MeetingStatusDescription ? `'${formData.MeetingStatusDescription}'` : null}, MeetingStatusDescription),
        MeetingStatusDatetime = IFNULL(${formData.MeetingStatusDatetime ? `'${formData.MeetingStatusDatetime}'` : null}, MeetingStatusDatetime),
        Description = IFNULL(${formData.Description ? `'${formData.Description}'` : null}, Description),
        Modified = NOW()
      WHERE ProjectMeetingID = ${id}
    `;

    const [data] = await db.query(query);
    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}


// Delete meeting
async function del(id) {
  try {
    const [data] = await db.query(`DELETE FROM ProjectMeeting WHERE ProjectMeetingID=${id}`);
    return data;
  } catch (error) {
    return false;
  }
}

// Get meetings by Group ID
async function getByGroupId(groupId) {
  try {
    const [data] = await db.query(`SELECT * FROM ProjectMeeting WHERE ProjectGroupID=${groupId}`);
    return data;
  } catch (error) {
    return false;
  }
}

//Extra
// ✅ Get meetings that happened already (for Meeting Entry page)
async function getPendingEntries() {
  try {
    const [data] = await db.query(`
      SELECT * FROM ProjectMeeting
      WHERE MeetingDateTime <= NOW()
      ORDER BY MeetingDateTime DESC
    `);
    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = { getAll, getById, insert, update, del, getByGroupId, getPendingEntries };