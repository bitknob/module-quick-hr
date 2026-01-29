#!/usr/bin/env node

const { sequelize } = require('./services/payment-service/src/config/database');
const { logger } = require('@hrm/common');

async function syncDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Syncing database models...');
    // Import models to ensure they're registered
    require('./services/payment-service/src/models');
    require('./services/employee-service/src/models');
    require('./services/auth-service/src/models');
    
    await sequelize.sync({ alter: false });
    console.log('Database synced successfully!');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase();
