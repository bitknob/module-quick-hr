const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'quick_hr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting database seeding...');

    await client.query('BEGIN');

    const departments = [
      { name: 'Engineering', description: 'Software Development and Engineering' },
      { name: 'Human Resources', description: 'HR Management and Operations' },
      { name: 'Finance', description: 'Financial Planning and Accounting' },
      { name: 'Sales', description: 'Sales and Business Development' },
      { name: 'Marketing', description: 'Marketing and Communications' },
    ];

    for (const dept of departments) {
      await client.query(
        'INSERT INTO "Departments" (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [dept.name, dept.description]
      );
    }

    console.log('Seeded departments successfully!');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

