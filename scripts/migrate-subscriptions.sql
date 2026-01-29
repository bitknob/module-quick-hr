-- Migration script for subscriptions table
-- This script creates the Subscriptions table for storing Razorpay subscription data

CREATE TABLE IF NOT EXISTS "Subscriptions" (
    id SERIAL PRIMARY KEY,
    company_id UUID NOT NULL,
    pricing_plan_id INTEGER NOT NULL,
    razorpay_subscription_id VARCHAR(255),
    razorpay_customer_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'expired', 'paused')),
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    interval VARCHAR(10) NOT NULL CHECK (interval IN ('monthly', 'yearly')),
    auto_renew BOOLEAN DEFAULT true,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    failed_payment_attempts INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_Subscriptions_company_id ON "Subscriptions"(company_id);
CREATE INDEX IF NOT EXISTS idx_Subscriptions_pricing_plan_id ON "Subscriptions"(pricing_plan_id);
CREATE INDEX IF NOT EXISTS idx_Subscriptions_razorpay_subscription_id ON "Subscriptions"(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_Subscriptions_status ON "Subscriptions"(status);
CREATE INDEX IF NOT EXISTS idx_Subscriptions_is_active ON "Subscriptions"(is_active);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_Subscriptions_updated_at 
    BEFORE UPDATE ON "Subscriptions" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE "Subscriptions" 
    ADD CONSTRAINT fk_subscriptions_company_id 
    FOREIGN KEY (company_id) REFERENCES "Companies"(id) ON DELETE CASCADE;

ALTER TABLE "Subscriptions" 
    ADD CONSTRAINT fk_subscriptions_pricing_plan_id 
    FOREIGN KEY (pricing_plan_id) REFERENCES "PricingPlans"(id) ON DELETE RESTRICT;

COMMENT ON TABLE "Subscriptions" IS 'Stores Razorpay subscription data for companies';
COMMENT ON COLUMN "Subscriptions".company_id IS 'Reference to the company that owns the subscription';
COMMENT ON COLUMN "Subscriptions".pricing_plan_id IS 'Reference to the pricing plan';
COMMENT ON COLUMN "Subscriptions".razorpay_subscription_id IS 'Razorpay subscription ID';
COMMENT ON COLUMN "Subscriptions".razorpay_customer_id IS 'Razorpay customer ID';
COMMENT ON COLUMN "Subscriptions".status IS 'Current subscription status';
COMMENT ON COLUMN "Subscriptions".trial_start_date IS 'Start date of 14-day trial period';
COMMENT ON COLUMN "Subscriptions".trial_end_date IS 'End date of 14-day trial period';
COMMENT ON COLUMN "Subscriptions".subscription_start_date IS 'Start date of paid subscription';
COMMENT ON COLUMN "Subscriptions".subscription_end_date IS 'End date of paid subscription';
COMMENT ON COLUMN "Subscriptions".next_billing_date IS 'Next billing date';
COMMENT ON COLUMN "Subscriptions".amount IS 'Subscription amount';
COMMENT ON COLUMN "Subscriptions".currency IS 'Currency code (INR)';
COMMENT ON COLUMN "Subscriptions".interval IS 'Billing interval (monthly/yearly)';
COMMENT ON COLUMN "Subscriptions".auto_renew IS 'Whether subscription auto-renews';
COMMENT ON COLUMN "Subscriptions".last_payment_date IS 'Date of last successful payment';
COMMENT ON COLUMN "Subscriptions".next_payment_date IS 'Date when next payment is due';
COMMENT ON COLUMN "Subscriptions".failed_payment_attempts IS 'Number of failed payment attempts';
COMMENT ON COLUMN "Subscriptions".is_active IS 'Whether subscription is currently active';
