const db = require("../db/mysql");

async function getAll() {
  try {
    const [data] = await db.query("SELECT * FROM Student");
    return data;
  } catch (error) {
    return false;
  }
}

async function getById(id) {
  try {
    const [data] = await db.query(`SELECT * FROM Student WHERE StudentID = ${id}`);
    return data[0];
  } catch (error) {
    return false;
  }
}

async function insert(formData) {
  try {
    const query = `INSERT INTO Student (StudentName, RollNo, Phone, Email, Password, Description, Created, Modified)
                   VALUES ('${formData.StudentName}', '${formData.RollNo}', '${formData.Phone}', '${formData.Email}', '${formData.Password}', '${formData.Description}', NOW(), NOW())`;
    const [data] = await db.query(query);
    return data;
  } catch (error) {
    return false;
  }
}

async function update(id, formData) {
  try {
    const query = `
      UPDATE Student SET
        StudentName = IFNULL(${formData.StudentName ? `'${formData.StudentName}'` : null}, StudentName),
        RollNo = IFNULL(${formData.RollNo ? `'${formData.RollNo}'` : null}, RollNo),
        Phone = IFNULL(${formData.Phone ? `'${formData.Phone}'` : null}, Phone),
        Email = IFNULL(${formData.Email ? `'${formData.Email}'` : null}, Email),
        Password = IFNULL(${formData.Password ? `'${formData.Password}'` : null}, Password),
        Description = IFNULL(${formData.Description ? `'${formData.Description}'` : null}, Description),
        Modified = NOW()
      WHERE StudentID = ${id}
    `;

    const [data] = await db.query(query);
    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}


async function del(id) {
  try {
    const [data] = await db.query(`DELETE FROM Student WHERE StudentID=${id}`);
    return data;
  } catch (error) {
    return false;
  }
}

// async function getByEmail(email) {
//   try {
//     const [data] = await db.query(`SELECT * FROM Student WHERE Email='${email}'`);
//     return data[0];
//   } catch (error) {
//     return false;
//   }
// }

// const getByEmail = async (Email) => {

//   console.log("Searching email in DB:", Email);

//   const query = "SELECT * FROM student WHERE Email = ?";
//   // const [rows] = await db.execute(query, [Email]);
//   const [rows] = await db.query(query, [Email]);


//   console.log("DB result:", rows);

//   return rows[0];
// };

const getByEmail = async (Email) => {
  try {
    console.log("Searching email in DB:", Email);

    const query = "SELECT * FROM student WHERE email = ?";
    const [rows] = await db.query(query, [Email]);

    console.log("DB result:", rows);

    return rows[0];

  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};


module.exports = { getAll, getById, insert, update, del, getByEmail };