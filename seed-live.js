const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smartq'
});

async function seed() {
  try {
    console.log('Seeding departments...');
    const d1 = await pool.query(`INSERT INTO departments (name, code) VALUES ('General Medicine', 'GM') RETURNING id;`);
    const d2 = await pool.query(`INSERT INTO departments (name, code) VALUES ('Cardiology', 'CA') RETURNING id;`);
    const d3 = await pool.query(`INSERT INTO departments (name, code) VALUES ('Orthopedics', 'OR') RETURNING id;`);
    
    console.log('Seeding doctors...');
    await pool.query(`INSERT INTO doctors (name, specialization, department_id) VALUES ('Dr. Priya Nair', 'General Physician', $1);`, [d1.rows[0].id]);
    await pool.query(`INSERT INTO doctors (name, specialization, department_id) VALUES ('Dr. Arun Verma', 'Cardiologist', $1);`, [d2.rows[0].id]);
    await pool.query(`INSERT INTO doctors (name, specialization, department_id) VALUES ('Dr. Sanjay Gupta', 'Orthopedic Surgeon', $1);`, [d3.rows[0].id]);
    
    console.log('Seeding complete!');
  } catch(e) {
    console.error('Error seeding', e);
  } finally {
    pool.end();
  }
}

seed();
