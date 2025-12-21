const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbName = process.env.DB_NAME || 'quick_hr';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting payroll tables migration...');
    await client.query('BEGIN');

    // Read and execute payroll tables migration
    console.log('Running migrate-payroll-tables.sql...');
    const payrollTablesSql = fs.readFileSync(
      path.join(__dirname, 'migrate-payroll-tables.sql'),
      'utf8'
    );
    await client.query(payrollTablesSql);

    // Read and execute complex payroll tables migration
    console.log('Running migrate-payroll-complex-tables.sql...');
    const complexTablesSql = fs.readFileSync(
      path.join(__dirname, 'migrate-payroll-complex-tables.sql'),
      'utf8'
    );
    await client.query(complexTablesSql);

    // Read and execute payslip generation tables migration
    console.log('Running migrate-payslip-generation-tables.sql...');
    const payslipTablesSql = fs.readFileSync(
      path.join(__dirname, 'migrate-payslip-generation-tables.sql'),
      'utf8'
    );
    await client.query(payslipTablesSql);

    await client.query('COMMIT');
    console.log('Payroll tables migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payroll migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Payroll migration process failed:', error);
  process.exit(1);
});

