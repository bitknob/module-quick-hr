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

async function seedSubscriptions() {
  const client = await pool.connect();
  try {
    console.log('Seeding subscriptions...');

    // Clear existing subscriptions
    await client.query('DELETE FROM "Subscriptions"');
    await client.query('DELETE FROM "SubscriptionHistory"');

    // Get existing companies
    const companiesResult = await client.query('SELECT id, name FROM "Companies" LIMIT 3');
    const companies = companiesResult.rows;

    if (companies.length === 0) {
      console.log('No companies found, skipping subscription seeding');
      return;
    }

    // Get pricing plans
    const pricingPlansResult = await client.query('SELECT id, name, monthly_price, yearly_price FROM "PricingPlans" ORDER BY sort_order');
    const pricingPlans = pricingPlansResult.rows;

    if (pricingPlans.length === 0) {
      console.log('No pricing plans found, skipping subscription seeding');
      return;
    }

    // Create sample subscriptions for each company
    for (const company of companies) {
      // Create a subscription for the first company (trial)
      if (company.id === companies[0].id) {
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        
        const subscriptionResult = await client.query(
          `INSERT INTO "Subscriptions" 
          (company_id, pricing_plan_id, status, amount, currency, interval)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [
            company.id,
            pricingPlans[0].id, // Starter plan
            'trial',
            pricingPlans[0].monthly_price,
            'INR',
            'monthly'
          ]
        );

        const subscriptionId = subscriptionResult.rows[0].id;

        // Create subscription history events
        await client.query(
          `INSERT INTO "SubscriptionHistory" (
            subscription_id, company_id, event_type, new_status, new_pricing_plan_id,
            amount, currency, description, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            subscriptionId,
            company.id,
            'created',
            'trial',
            pricingPlans[0].id,
            pricingPlans[0].monthly_price,
            'INR',
            'Subscription created with 14-day trial',
            JSON.stringify({
              trialStartDate,
              trialEndDate,
              autoRenew: true,
              interval: 'monthly'
            })
          ]
        );

        await client.query(
          `INSERT INTO "SubscriptionHistory" (
            subscription_id, company_id, event_type, new_status, description, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            subscriptionId,
            company.id,
            'trial_started',
            'trial',
            '14-day trial period started',
            JSON.stringify({
              trialStartDate,
              trialEndDate,
              remainingDays: 14
            })
          ]
        );
      }

      // Create active subscription for the second company
      if (company.id === companies[1]?.id) {
        const subscriptionResult = await client.query(
          `INSERT INTO "Subscriptions" 
          (company_id, pricing_plan_id, status, amount, currency, interval)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [
            company.id,
            pricingPlans[1].id, // Professional plan
            'active',
            pricingPlans[1].monthly_price,
            'INR',
            'monthly'
          ]
        );

        const subscriptionId = subscriptionResult.rows[0].id;

        // Create history for active subscription
        await client.query(
          `INSERT INTO "SubscriptionHistory" (
            subscription_id, company_id, event_type, new_status, new_pricing_plan_id,
            amount, currency, payment_method, transaction_id, description, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            subscriptionId,
            company.id,
            'created',
            'active',
            pricingPlans[1].id,
            pricingPlans[1].monthly_price,
            'INR',
            'razorpay',
            `pay_${Date.now()}`,
            'Subscription created and activated',
            JSON.stringify({
              autoRenew: true,
              interval: 'monthly',
              paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            })
          ]
        );

        await client.query(
          `INSERT INTO "SubscriptionHistory" (
            subscription_id, company_id, event_type, amount, currency, payment_method,
            transaction_id, description, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            subscriptionId,
            company.id,
            'payment_successful',
            pricingPlans[1].monthly_price,
            'INR',
            'razorpay',
            `pay_${Date.now()}`,
            `Payment of ${pricingPlans[1].monthly_price} INR successful`,
            JSON.stringify({
              paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
              nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            })
          ]
        );
      }

      // Create expired subscription for the third company
      if (company.id === companies[2]?.id) {
        const subscriptionResult = await client.query(
          `INSERT INTO "Subscriptions" 
          (company_id, pricing_plan_id, status, amount, currency, interval)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [
            company.id,
            pricingPlans[2].id, // Enterprise plan
            'expired',
            pricingPlans[2].monthly_price,
            'INR',
            'monthly'
          ]
        );

        const subscriptionId = subscriptionResult.rows[0].id;

        // Create history for expired subscription
        await client.query(
          `INSERT INTO "SubscriptionHistory" (
            subscription_id, company_id, event_type, new_status, new_pricing_plan_id,
            amount, currency, description, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            subscriptionId,
            company.id,
            'created',
            'active',
            pricingPlans[2].id,
            pricingPlans[2].monthly_price,
            'INR',
            'Subscription created for enterprise plan',
            JSON.stringify({
              autoRenew: true,
              interval: 'monthly'
            })
          ]
        );

        // Add payment failure events
        for (let i = 1; i <= 3; i++) {
          await client.query(
            `INSERT INTO "SubscriptionHistory" (
              subscription_id, company_id, event_type, razorpay_event_id, description, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              subscriptionId,
              company.id,
              'payment_failed',
              `evt_failed_${i}`,
              `Payment failed (attempt ${i})`,
              JSON.stringify({
                failedPaymentAttempts: i,
                errorMessage: 'Insufficient funds',
                paymentDate: new Date(Date.now() - (60 - i * 10) * 24 * 60 * 60 * 1000)
              })
            ]
          );
        }

        await client.query(
          `INSERT INTO "SubscriptionHistory" (
            subscription_id, company_id, event_type, previous_status, new_status, description, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            subscriptionId,
            company.id,
            'expired',
            'active',
            'expired',
            'Subscription expired due to payment failures',
            JSON.stringify({
              failedPaymentAttempts: 3,
              expiredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            })
          ]
        );
      }
    }

    console.log('Subscriptions seeded successfully!');
  } catch (error) {
    console.error('Subscriptions seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { seedSubscriptions };
