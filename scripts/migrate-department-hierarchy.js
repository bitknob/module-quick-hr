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

async function columnExists(client, tableName, columnName) {
  const result = await client.query(
    `SELECT column_name 
     FROM information_schema.columns 
     WHERE table_name = $1 AND column_name = $2`,
    [tableName, columnName]
  );
  return result.rows.length > 0;
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT table_name 
     FROM information_schema.tables 
     WHERE table_name = $1`,
    [tableName]
  );
  return result.rows.length > 0;
}

async function constraintExists(client, constraintName) {
  const result = await client.query(
    `SELECT constraint_name 
     FROM information_schema.table_constraints 
     WHERE constraint_name = $1`,
    [constraintName]
  );
  return result.rows.length > 0;
}

async function indexExists(client, indexName) {
  const result = await client.query(
    `SELECT indexname 
     FROM pg_indexes 
     WHERE indexname = $1`,
    [indexName]
  );
  return result.rows.length > 0;
}

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting department hierarchy and user modules migration...');
    await client.query('BEGIN');

    // Check if Departments table exists
    const departmentsTableExists = await tableExists(client, 'Departments');
    
    if (departmentsTableExists) {
      console.log('Departments table exists. Adding new columns...');

      // Add parentDepartmentId column if it doesn't exist
      const parentDeptIdExists = await columnExists(client, 'Departments', 'parentDepartmentId');
      if (!parentDeptIdExists) {
        console.log('Adding parentDepartmentId column...');
        await client.query(`
          ALTER TABLE "Departments" 
          ADD COLUMN "parentDepartmentId" UUID
        `);
        console.log('parentDepartmentId column added.');
      } else {
        console.log('parentDepartmentId column already exists.');
      }

      // Add hasSubDepartments column if it doesn't exist
      const hasSubDeptsExists = await columnExists(client, 'Departments', 'hasSubDepartments');
      if (!hasSubDeptsExists) {
        console.log('Adding hasSubDepartments column...');
        await client.query(`
          ALTER TABLE "Departments" 
          ADD COLUMN "hasSubDepartments" BOOLEAN DEFAULT false
        `);
        console.log('hasSubDepartments column added.');
      } else {
        console.log('hasSubDepartments column already exists.');
      }

      // Add foreign key constraint if it doesn't exist
      const fkExists = await constraintExists(client, 'fk_department_parent');
      if (!fkExists) {
        console.log('Adding foreign key constraint for parentDepartmentId...');
        await client.query(`
          ALTER TABLE "Departments" 
          ADD CONSTRAINT fk_department_parent 
          FOREIGN KEY ("parentDepartmentId") 
          REFERENCES "Departments"(id) 
          ON DELETE SET NULL
        `);
        console.log('Foreign key constraint added.');
      } else {
        console.log('Foreign key constraint already exists.');
      }

      // Add index if it doesn't exist
      const indexExistsResult = await indexExists(client, 'idx_departments_parent_id');
      if (!indexExistsResult) {
        console.log('Adding index for parentDepartmentId...');
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_departments_parent_id 
          ON "Departments"("parentDepartmentId")
        `);
        console.log('Index added.');
      } else {
        console.log('Index already exists.');
      }
    } else {
      console.log('Departments table does not exist. Run the main migration first.');
    }

    // Create UserModules table if it doesn't exist
    const userModulesTableExists = await tableExists(client, 'UserModules');
    if (!userModulesTableExists) {
      console.log('Creating UserModules table...');
      await client.query(`
        CREATE TABLE "UserModules" (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          "userId" UUID NOT NULL,
          "moduleKey" VARCHAR(100) NOT NULL,
          "moduleName" VARCHAR(255) NOT NULL,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_user_module_user FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE,
          CONSTRAINT uk_user_module UNIQUE ("userId", "moduleKey")
        )
      `);
      console.log('UserModules table created.');

      // Create indexes for UserModules
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_modules_user_id ON "UserModules"("userId")
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_modules_module_key ON "UserModules"("moduleKey")
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_modules_active ON "UserModules"("isActive")
      `);
      console.log('UserModules indexes created.');
    } else {
      console.log('UserModules table already exists.');
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Migration process failed:', error);
  process.exit(1);
});

