-- Migration script for pricing plans table
-- This script creates the PricingPlans table for storing subscription plans

CREATE TABLE IF NOT EXISTS "PricingPlans" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    yearly_price DECIMAL(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_PricingPlans_is_active ON "PricingPlans"(is_active);
CREATE INDEX IF NOT EXISTS idx_PricingPlans_sort_order ON "PricingPlans"(sort_order);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_PricingPlans_updated_at 
    BEFORE UPDATE ON "PricingPlans" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Clear existing data and insert new pricing plans
DELETE FROM "PricingPlans";

-- Insert new pricing plans based on updated requirements
INSERT INTO "PricingPlans" (name, description, monthly_price, yearly_price, features, sort_order) VALUES
(
    'Starter',
    'Perfect for small teams getting started with HR management',
    2499.00,
    24990.00,
    '[
        {"name": "Up to 25 employees", "included": true},
        {"name": "Employee directory", "included": true},
        {"name": "Leave management", "included": true},
        {"name": "Basic attendance tracking", "included": true},
        {"name": "Email support", "included": true},
        {"name": "Document storage (5GB)", "included": true},
        {"name": "Custom workflows", "included": false},
        {"name": "Advanced analytics", "included": false},
        {"name": "API access", "included": false},
        {"name": "SSO integration", "included": false}
    ]',
    1
),
(
    'Professional',
    'For growing companies that need more power and flexibility',
    6499.00,
    64990.00,
    '[
        {"name": "Up to 100 employees", "included": true},
        {"name": "Employee directory", "included": true},
        {"name": "Leave management", "included": true},
        {"name": "Advanced attendance tracking", "included": true},
        {"name": "Priority email & chat support", "included": true},
        {"name": "Document storage (50GB)", "included": true},
        {"name": "Custom workflows", "included": true},
        {"name": "Advanced analytics", "included": true},
        {"name": "API access", "included": false},
        {"name": "SSO integration", "included": false}
    ]',
    2
),
(
    'Enterprise',
    'For large organizations with complex HR requirements',
    16499.00,
    164990.00,
    '[
        {"name": "Unlimited employees", "included": true},
        {"name": "Employee directory", "included": true},
        {"name": "Leave management", "included": true},
        {"name": "Advanced attendance tracking", "included": true},
        {"name": "24/7 dedicated support", "included": true},
        {"name": "Unlimited document storage", "included": true},
        {"name": "Custom workflows", "included": true},
        {"name": "Advanced analytics", "included": true},
        {"name": "API access", "included": true},
        {"name": "SSO integration", "included": true}
    ]',
    3
);

COMMENT ON TABLE "PricingPlans" IS 'Stores subscription pricing plans with features and billing options';
COMMENT ON COLUMN "PricingPlans".features IS 'JSON array containing plan features with inclusion status';
COMMENT ON COLUMN "PricingPlans".monthly_price IS 'Monthly price in INR';
COMMENT ON COLUMN "PricingPlans".yearly_price IS 'Yearly price in INR (typically with discount)';
