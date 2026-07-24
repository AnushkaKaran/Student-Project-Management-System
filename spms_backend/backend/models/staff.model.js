const db = require("../db/mysql");

// Get all staff
async function getAll() {
  try {
    const [data] = await db.query("SELECT * FROM Staff");
    return data;
  } catch (error) {
    return false;
  }
}

// Get staff by ID
async function getById(id) {
  try {
    const [data] = await db.query(`SELECT * FROM Staff WHERE StaffID=${id}`);
    return data[0];
  } catch (error) {
    return false;
  }
}

// Insert staff
async function insert(formData) {
  try {
    const query = `INSERT INTO Staff (StaffName, Phone, Email, Password, Role, Description, Created, Modified)
                   VALUES ('${formData.StaffName}', '${formData.Phone}', '${formData.Email}', '${formData.Password}', IFNULL('${formData.Role}', 'Faculty'), '${formData.Description}', NOW(), NOW())`;
    const [data] = await db.query(query);
    return data;
  } catch (error) {
    return false;
  }
}

// Update staff
async function update(id, formData) {
  try {
    const query = `
      UPDATE Staff SET
        StaffName = IFNULL(${formData.StaffName ? `'${formData.StaffName}'` : null}, StaffName),
        Phone = IFNULL(${formData.Phone ? `'${formData.Phone}'` : null}, Phone),
        Email = IFNULL(${formData.Email ? `'${formData.Email}'` : null}, Email),
        Password = IFNULL(${formData.Password ? `'${formData.Password}'` : null}, Password),
        Role = IFNULL(${formData.Role ? `'${formData.Role}'` : null}, Role),
        Description = IFNULL(${formData.Description ? `'${formData.Description}'` : null}, Description),
        Modified = NOW()
      WHERE StaffID = ${id}
    `;

    const [data] = await db.query(query);
    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}


// Delete staff
async function del(id) {
  try {
    const [data] = await db.query(`DELETE FROM Staff WHERE StaffID=${id}`);
    return data;
  } catch (error) {
    return false;
  }
}

// Get staff by Email (for login)
async function getByEmail(email) {
  try {
    const [data] = await db.query(`SELECT * FROM Staff WHERE Email='${email}'`);
    return data[0];
  } catch (error) {
    return false;
  }
}

module.exports = { getAll, getById, insert, update, del, getByEmail };