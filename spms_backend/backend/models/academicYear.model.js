const db = require("../db/mysql");

async function getAll() {
  try {
    const [data] = await db.query("SELECT * FROM AcademicYear");
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function getById(id) {
  try {
    const [data] = await db.query(`SELECT * FROM AcademicYear WHERE YearID=${db.escape(id)}`);
    return data[0];
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function insert(formData) {
  try {
    const query = `INSERT INTO AcademicYear (YearName, IsActive) VALUES (${db.escape(formData.YearName)}, ${formData.IsActive !== undefined ? db.escape(formData.IsActive) : true})`;
    const [data] = await db.query(query);
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function update(id, formData) {
  try {
    const query = `
      UPDATE AcademicYear SET
        YearName = IFNULL(${formData.YearName ? db.escape(formData.YearName) : null}, YearName),
        IsActive = IFNULL(${formData.IsActive !== undefined ? db.escape(formData.IsActive) : null}, IsActive)
      WHERE YearID = ${db.escape(id)}
    `;
    const [data] = await db.query(query);
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function del(id) {
  try {
    const [data] = await db.query(`DELETE FROM AcademicYear WHERE YearID=${db.escape(id)}`);
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = { getAll, getById, insert, update, del };
