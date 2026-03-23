const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

async function seed() {
  const dbPath = path.join(__dirname, 'apps', 'api', 'database.sqlite');
  console.log('Connecting to database at:', dbPath);

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log('Creating tables...');

  try {
    // 1. Staff Users
    await db.exec(`
      CREATE TABLE IF NOT EXISTS staff_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        employee_id TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        department_id TEXT,
        is_active BOOLEAN DEFAULT 1,
        last_login DATETIME
      )
    `);

    // 2. Departments
    await db.exec(`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT 1
      )
    `);

    // 3. Doctors
    await db.exec(`
      CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        specialization TEXT NOT NULL,
        department_id TEXT,
        status TEXT DEFAULT 'AVAILABLE',
        average_consult_minutes INTEGER DEFAULT 10,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      )
    `);

    // 4. Patients
    await db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        mobile TEXT UNIQUE NOT NULL,
        age INTEGER,
        gender TEXT,
        is_returning BOOLEAN DEFAULT 0
      )
    `);

    // 5. Tokens
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tokens (
        id TEXT PRIMARY KEY,
        number INTEGER NOT NULL,
        display_number TEXT NOT NULL,
        patient_id TEXT,
        department_id TEXT,
        doctor_id TEXT,
        status TEXT DEFAULT 'ISSUED',
        priority TEXT DEFAULT 'REGULAR',
        issued_at DATETIME DEFAULT (datetime('now')),
        called_at DATETIME,
        consulted_at DATETIME,
        no_show_count INTEGER DEFAULT 0,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
      )
    `);
  } catch (err) {
    console.error('Error creating tables:', err);
    throw err;
  }

  console.log('Seeding initial data...');

  try {
    // Seed Departments
    const depts = [
      { id: 'dept-opd', name: 'General OPD', code: 'GP' },
      { id: 'dept-cardio', name: 'Cardiology', code: 'CD' },
      { id: 'dept-pedia', name: 'Pediatrics', code: 'PD' }
    ];
    for (const d of depts) {
      await db.run('INSERT OR IGNORE INTO departments (id, name, code) VALUES (?, ?, ?)', [d.id, d.name, d.code]);
    }

    // Seed Staff
    await db.run(`
      INSERT OR IGNORE INTO staff_users (id, name, email, password, employee_id, role, department_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['staff-admin', 'System Admin', 'admin@smartq.com', 'password123', 'EMP001', 'ADMIN', null]);

    // Seed Patients
    const patients = [
      { id: 'pat-1', name: 'John Doe', mobile: '9876543210' },
      { id: 'pat-2', name: 'Emergency Jane', mobile: '9999999999' }
    ];
    for (const p of patients) {
      await db.run('INSERT OR IGNORE INTO patients (id, name, mobile) VALUES (?, ?, ?)', [p.id, p.name, p.mobile]);
    }

    // Seed Tokens
    // Regular token for John Doe
    await db.run(`
      INSERT OR IGNORE INTO tokens (id, number, display_number, patient_id, department_id, priority, status, issued_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['tok-1', 1, 'GP-001', 'pat-1', 'dept-opd', 'REGULAR', 'ISSUED', '2026-03-23 10:00:00']);

    // EMERGENCY token for Emergency Jane (Dummy token that should appear at top)
    await db.run(`
      INSERT OR IGNORE INTO tokens (id, number, display_number, patient_id, department_id, priority, status, issued_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['tok-emergency', 2, 'GP-002', 'pat-2', 'dept-opd', 'EMERGENCY', 'ISSUED', '2026-03-23 10:05:00']);

    console.log('✓ Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
    throw err;
  } finally {
    await db.close();
  }
}

seed().catch(err => {
  console.error('Fatal error seeding database:', err);
  process.exit(1);
});
