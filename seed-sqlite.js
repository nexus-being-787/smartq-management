const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function seed() {
  try {
    const dbPath = path.join(__dirname, 'apps/api/database.sqlite');
    console.log(`Connecting to SQLite database at ${dbPath}...`);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Creating staff_users table...');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS staff_users (
        id TEXT PRIMARY KEY,
        auth_user_id TEXT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        employee_id TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        department_id TEXT,
        is_active INTEGER DEFAULT 1,
        last_login TEXT
      );
    `);

    await db.exec('DELETE FROM staff_users'); // clear existing data

    console.log('Seeding 6 mock users...');
    const users = [
      { id: '1', name: 'Dr. Priya Nair', email: 'priya@smartq.com', password: 'password123', empId: 'DR-001', role: 'DOCTOR', dept: 'gm' },
      { id: '2', name: 'Dr. Ravi Shankar', email: 'ravi@smartq.com', password: 'password123', empId: 'DR-002', role: 'DOCTOR', dept: 'ortho' },
      { id: '3', name: 'Dr. Seetha Lakshmanan', email: 'seetha@smartq.com', password: 'password123', empId: 'DR-003', role: 'DOCTOR', dept: 'cardio' },
      { id: '4', name: 'Kavitha R.', email: 'kavitha@smartq.com', password: 'password123', empId: 'RC-001', role: 'RECEPTIONIST', dept: 'gm' },
      { id: '5', name: 'Murugan S.', email: 'murugan@smartq.com', password: 'password123', empId: 'RC-002', role: 'RECEPTIONIST', dept: 'ortho', active: 0 },
      { id: '6', name: 'System Admin', email: 'admin@smartq.com', password: 'password123', empId: 'AD-001', role: 'ADMIN', dept: null },
    ];

    for (const u of users) {
      await db.run(
        `INSERT INTO staff_users (id, name, email, password, employee_id, role, department_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.name, u.email, u.password, u.empId, u.role, u.dept, u.active !== 0 ? 1 : 0]
      );
    }

    console.log('Seeding complete! You can now login with these emails and password: password123');
    await db.close();
  } catch(e) {
    console.error('Error seeding SQLite database:', e);
  }
}

seed();
