const db = require('./db/mysql');

async function run() {
  try {
    // Add columns if they missed
    try {
        await db.query("ALTER TABLE Staff ADD COLUMN Role VARCHAR(50) DEFAULT 'Faculty'");
        console.log("Added Role to Staff");
    } catch (e) { console.log(e.message) }
    
    try {
        await db.query("ALTER TABLE Student ADD COLUMN Password VARCHAR(255) DEFAULT 'student123'");
        console.log("Added Password to Student");
    } catch(e) { console.log(e.message) }
      
    // Update data
    const [uStudent] = await db.query("UPDATE Student SET Password = 'student123'");
    const [uAdmin] = await db.query("UPDATE Staff SET Password = 'admin123' WHERE Role = 'Admin'");
    const [uFac] = await db.query("UPDATE Staff SET Password = 'faculty123' WHERE Role != 'Admin' OR Role IS NULL");
    console.log('Passwords updated successfully!');
  } catch (err) {
    console.error('Error updating passwords:', err);
  } finally {
    process.exit(0);
  }
}

run();
