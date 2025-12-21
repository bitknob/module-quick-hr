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

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT table_name 
     FROM information_schema.tables 
     WHERE table_name = $1`,
    [tableName]
  );
  return result.rows.length > 0;
}

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting menus migration...');
    await client.query('BEGIN');

    const menusTableExists = await tableExists(client, 'Menus');
    if (!menusTableExists) {
      console.log('Creating Menus table...');
      await client.query(`
        CREATE TABLE "Menus" (
          id VARCHAR(100) PRIMARY KEY,
          label VARCHAR(255) NOT NULL,
          path VARCHAR(500) NOT NULL,
          icon VARCHAR(100),
          "parentId" VARCHAR(100),
          "displayOrder" INTEGER DEFAULT 0,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_menu_parent FOREIGN KEY ("parentId") REFERENCES "Menus"(id) ON DELETE CASCADE
        )
      `);
      console.log('Menus table created.');

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON "Menus"("parentId")
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_menus_display_order ON "Menus"("displayOrder")
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_menus_is_active ON "Menus"("isActive")
      `);
      console.log('Menus indexes created.');
    } else {
      console.log('Menus table already exists.');
    }

    const menuRolesTableExists = await tableExists(client, 'MenuRoles');
    if (!menuRolesTableExists) {
      console.log('Creating MenuRoles table...');
      await client.query(`
        CREATE TABLE "MenuRoles" (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          "menuId" VARCHAR(100) NOT NULL,
          "roleKey" VARCHAR(50) NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_menu_role_menu FOREIGN KEY ("menuId") REFERENCES "Menus"(id) ON DELETE CASCADE,
          CONSTRAINT uk_menu_role UNIQUE ("menuId", "roleKey")
        )
      `);
      console.log('MenuRoles table created.');

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_menu_roles_menu_id ON "MenuRoles"("menuId")
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_menu_roles_role_key ON "MenuRoles"("roleKey")
      `);
      console.log('MenuRoles indexes created.');
    } else {
      console.log('MenuRoles table already exists.');
    }

    const triggerExists = await client.query(
      `SELECT trigger_name 
       FROM information_schema.triggers 
       WHERE trigger_name = 'update_menus_updated_at'`
    );
    if (triggerExists.rows.length === 0) {
      console.log('Creating trigger for Menus table...');
      await client.query(`
        CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON "Menus"
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('Trigger created.');
    } else {
      console.log('Trigger already exists.');
    }

    await client.query('COMMIT');
    console.log('Menus migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Menus migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Menus migration process failed:', error);
  process.exit(1);
});

