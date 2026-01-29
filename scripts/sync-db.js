#!/usr/bin/env node

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

async function syncDatabase() {
  const client = await pool.connect();
  try {
    console.log('Creating payment service tables...');
    
    // Create PricingPlans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "PricingPlans" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        monthly_price DECIMAL(10,2) NOT NULL,
        yearly_price DECIMAL(10,2) NOT NULL,
        features JSONB,
        status VARCHAR(50) DEFAULT 'active',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Subscriptions" (
        id SERIAL PRIMARY KEY,
        "companyId" UUID NOT NULL REFERENCES "Companies"(id) ON DELETE CASCADE,
        "pricingPlanId" INTEGER NOT NULL REFERENCES "PricingPlans"(id),
        status VARCHAR(50) DEFAULT 'trial',
        "trialStartDate" TIMESTAMP,
        "trialEndDate" TIMESTAMP,
        "startDate" TIMESTAMP,
        "endDate" TIMESTAMP,
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'INR',
        interval VARCHAR(20) DEFAULT 'monthly',
        "autoRenew" BOOLEAN DEFAULT true,
        "isActive" BOOLEAN DEFAULT true,
        "razorpaySubscriptionId" VARCHAR(255),
        "razorpayCustomerId" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create SubscriptionHistory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "SubscriptionHistory" (
        id SERIAL PRIMARY KEY,
        "subscriptionId" INTEGER NOT NULL REFERENCES "Subscriptions"(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        oldStatus VARCHAR(50),
        newStatus VARCHAR(50),
        reason TEXT,
        metadata JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables created successfully!');
    
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

syncDatabase().then(() => {
  console.log('Database sync completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Database sync failed:', error);
  process.exit(1);
});
