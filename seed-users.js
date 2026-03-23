const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/smartq'
});

async function seed() {
  try {
    console.log('Creating staff_users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auth_user_id UUID,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        department_id VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP
      );
    `);

    // We can clear it to ensure clean seed
    await pool.query(`TRUNCATE TABLE staff_users CASCADE;`);

    console.log('Seeding 6 mock users...');
    const users = [
      { name: 'Dr. Priya Nair', email: 'priya@smartq.com', password: 'password123', empId: 'DR-001', role: 'DOCTOR', dept: 'gm' },
      { name: 'Dr. Ravi Shankar', email: 'ravi@smartq.com', password: 'password123', empId: 'DR-002', role: 'DOCTOR', dept: 'ortho' },
      { name: 'Dr. Seetha Lakshmanan', email: 'seetha@smartq.com', password: 'password123', empId: 'DR-003', role: 'DOCTOR', dept: 'cardio' },
      { name: 'Kavitha R.', email: 'kavitha@smartq.com', password: 'password123', empId: 'RC-001', role: 'RECEPTIONIST', dept: 'gm' },
      { name: 'Murugan S.', email: 'murugan@smartq.com', password: 'password123', empId: 'RC-002', role: 'RECEPTIONIST', dept: 'ortho', active: false },
      { name: 'System Admin', email: 'admin@smartq.com', password: 'password123', empId: 'AD-001', role: 'ADMIN', dept: null },
    ];

    for (const u of users) {
      await pool.query(
        `INSERT INTO staff_users (name, email, password, employee_id, role, department_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [u.name, u.email, u.password, u.empId, u.role, u.dept, u.active !== false]
      );
    }

    console.log('Seeding complete! You can now login with these emails and password: password123');
  } catch(e) {
    console.error('Error seeding', e);
  } finally {
    pool.end();
  }
}

seed();
