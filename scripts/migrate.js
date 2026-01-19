const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbName = process.env.DB_NAME || 'quick_hr';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';

// Pool for connecting to default postgres database to create the target database
const adminPool = new Pool({
  host: dbHost,
  port: dbPort,
  database: 'postgres',
  user: dbUser,
  password: dbPassword,
});

// Pool for connecting to the target database
const pool = new Pool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
});

async function ensureDatabaseExists() {
  const adminClient = await adminPool.connect();
  try {
    console.log(
      `Using database name: "${dbName}" (from ${process.env.DB_NAME ? 'DB_NAME env var' : 'default'})`
    );
    console.log(`Checking if database "${dbName}" exists...`);

    const result = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      dbName,
    ]);

    if (result.rows.length === 0) {
      console.log(`Database "${dbName}" does not exist. Creating it...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully!`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error('Error ensuring database exists:', error);
    throw error;
  } finally {
    adminClient.release();
  }
}

async function migrate() {
  try {
    // First, ensure the database exists
    await ensureDatabaseExists();

    // Now connect to the target database and run migrations
    const client = await pool.connect();
    try {
      console.log('Starting database migration...');

      // Run base schema
      const createTablesSql = fs.readFileSync(path.join(__dirname, 'create-tables.sql'), 'utf8');

      await client.query('BEGIN');
      await client.query(createTablesSql);
      console.log('Base schema created/updated successfully!');

      // Run mustChangePassword migration
      const mustChangePasswordSql = fs.readFileSync(
        path.join(__dirname, 'migrate-add-must-change-password.sql'),
        'utf8'
      );
      await client.query(mustChangePasswordSql);
      console.log('mustChangePassword column migration completed!');

      await client.query('COMMIT');

      console.log('Database migration completed successfully!');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Migration failed:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    await adminPool.end();
  }
}

migrate();
