const db = require("../db/mysql");

// Get all project groups
// async function getAll() {
//   try {
//     const [data] = await db.query("SELECT * FROM ProjectGroup");
//     return data;
//   } catch (error) {
//     return false;
//   }
// }

async function getAll() {
  try {
    const [data] = await db.query(`
      SELECT 
        g.ProjectGroupID,
        g.ProjectGroupName,
        g.ProjectTitle,
        g.ProjectArea,
        g.ProjectDescription,
        g.AverageCPI,
        g.Description,
        g.GuideStaffName,
        g.ConvenerStaffID,
        g.ExpertStaffID,
        g.ProjectTypeID,
        pt.ProjectTypeName
      FROM ProjectGroup g
      LEFT JOIN ProjectType pt
      ON g.ProjectTypeID = pt.ProjectTypeID
    `);

    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Get project group by ID
async function getById(id) {
  try {
    const [data] = await db.query(`SELECT * FROM ProjectGroup WHERE ProjectGroupID=${id}`);
    return data[0];
  } catch (error) {
    return false;
  }
}

// Insert project group
// async function insert(formData) {
//   try {
//     const query = `INSERT INTO ProjectGroup 
//       (ProjectGroupName, ProjectTypeID, GuideStaffName, ProjectTitle, ProjectArea, ProjectDescription, AverageCPI, ConvenerStaffID, ExpertStaffID, Description, Created, Modified)
//       VALUES ('${formData.ProjectGroupName}', '${formData.ProjectTypeID}', '${formData.GuideStaffName}', '${formData.ProjectTitle}', '${formData.ProjectArea}', '${formData.ProjectDescription}', '${formData.AverageCPI}', '${formData.ConvenerStaffID}', '${formData.ExpertStaffID}', '${formData.Description}', NOW(), NOW())`;
//     const [data] = await db.query(query);
//     return data;
//   } catch (error) {
//     return false;
//   }
// }

async function insert(formData) {
  try {

    const query = `
      INSERT INTO ProjectGroup
      (ProjectGroupName, ProjectTypeID, ProjectTitle, Created, Modified)
      VALUES
      ('${formData.ProjectGroupName}',
       '${formData.ProjectTypeID}',
       '${formData.ProjectTitle}',
       NOW(),
       NOW())
    `;

    const [data] = await db.query(query);

    return data;

  } catch (error) {

    console.log(error);

    return false;

  }
}

// Update project group
async function update(id, formData) {
  try {
    const query = `
      UPDATE ProjectGroup SET
        ProjectGroupName = IFNULL(${formData.ProjectGroupName ? `'${formData.ProjectGroupName}'` : null}, ProjectGroupName),
        ProjectTypeID = IFNULL(${formData.ProjectTypeID ?? null}, ProjectTypeID),
        GuideStaffName = IFNULL(${formData.GuideStaffName ? `'${formData.GuideStaffName}'` : null}, GuideStaffName),
        ProjectTitle = IFNULL(${formData.ProjectTitle ? `'${formData.ProjectTitle}'` : null}, ProjectTitle),
        ProjectArea = IFNULL(${formData.ProjectArea ? `'${formData.ProjectArea}'` : null}, ProjectArea),
        ProjectDescription = IFNULL(${formData.ProjectDescription ? `'${formData.ProjectDescription}'` : null}, ProjectDescription),
        AverageCPI = IFNULL(${formData.AverageCPI ?? null}, AverageCPI),
        ConvenerStaffID = IFNULL(${formData.ConvenerStaffID ?? null}, ConvenerStaffID),
        ExpertStaffID = IFNULL(${formData.ExpertStaffID ?? null}, ExpertStaffID),
        Description = IFNULL(${formData.Description ? `'${formData.Description}'` : null}, Description),
        Modified = NOW()
      WHERE ProjectGroupID = ${id}
    `;

    const [data] = await db.query(query);
    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}



// Delete project group
async function del(id) {
  try {
    const [data] = await db.query(`DELETE FROM ProjectGroup WHERE ProjectGroupID=${id}`);
    return data;
  } catch (error) {
    return false;
  }
}

module.exports = { getAll, getById, insert, update, del };