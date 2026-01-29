-- Migration script for subscription history table
-- This script creates the SubscriptionHistory table for tracking subscription lifecycle events

CREATE TABLE IF NOT EXISTS "SubscriptionHistory" (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL,
    company_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('created', 'updated', 'cancelled', 'paused', 'resumed', 'payment_successful', 'payment_failed', 'trial_started', 'trial_ended', 'plan_changed', 'reactivated', 'expired')),
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    previous_pricing_plan_id INTEGER,
    new_pricing_plan_id INTEGER,
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    razorpay_event_id VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_SubscriptionHistory_subscription_id ON "SubscriptionHistory"(subscription_id);
CREATE INDEX IF NOT EXISTS idx_SubscriptionHistory_company_id ON "SubscriptionHistory"(company_id);
CREATE INDEX IF NOT EXISTS idx_SubscriptionHistory_event_type ON "SubscriptionHistory"(event_type);
CREATE INDEX IF NOT EXISTS idx_SubscriptionHistory_created_at ON "SubscriptionHistory"(created_at);
CREATE INDEX IF NOT EXISTS idx_SubscriptionHistory_transaction_id ON "SubscriptionHistory"(transaction_id);
CREATE INDEX IF NOT EXISTS idx_SubscriptionHistory_razorpay_event_id ON "SubscriptionHistory"(razorpay_event_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_SubscriptionHistory_updated_at 
    BEFORE UPDATE ON "SubscriptionHistory" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE "SubscriptionHistory" 
    ADD CONSTRAINT fk_subscription_history_subscription_id 
    FOREIGN KEY (subscription_id) REFERENCES "Subscriptions"(id) ON DELETE CASCADE;

ALTER TABLE "SubscriptionHistory" 
    ADD CONSTRAINT fk_subscription_history_company_id 
    FOREIGN KEY (company_id) REFERENCES "Companies"(id) ON DELETE CASCADE;

ALTER TABLE "SubscriptionHistory" 
    ADD CONSTRAINT fk_subscription_history_previous_plan_id 
    FOREIGN KEY (previous_pricing_plan_id) REFERENCES "PricingPlans"(id) ON DELETE SET NULL;

ALTER TABLE "SubscriptionHistory" 
    ADD CONSTRAINT fk_subscription_history_new_plan_id 
    FOREIGN KEY (new_pricing_plan_id) REFERENCES "PricingPlans"(id) ON DELETE SET NULL;

COMMENT ON TABLE "SubscriptionHistory" IS 'Tracks subscription lifecycle events and payment history';
COMMENT ON COLUMN "SubscriptionHistory".subscription_id IS 'Reference to the subscription';
COMMENT ON COLUMN "SubscriptionHistory".company_id IS 'Reference to the company';
COMMENT ON COLUMN "SubscriptionHistory".event_type IS 'Type of event (created, updated, cancelled, etc.)';
COMMENT ON COLUMN "SubscriptionHistory".previous_status IS 'Previous subscription status before change';
COMMENT ON COLUMN "SubscriptionHistory".new_status IS 'New subscription status after change';
COMMENT ON COLUMN "SubscriptionHistory".previous_pricing_plan_id IS 'Previous pricing plan before change';
COMMENT ON COLUMN "SubscriptionHistory".new_pricing_plan_id IS 'New pricing plan after change';
COMMENT ON COLUMN "SubscriptionHistory".amount IS 'Payment amount for payment events';
COMMENT ON COLUMN "SubscriptionHistory".currency IS 'Currency code (INR)';
COMMENT ON COLUMN "SubscriptionHistory".payment_method IS 'Payment method used';
COMMENT ON COLUMN "SubscriptionHistory".transaction_id IS 'Payment transaction ID';
COMMENT ON COLUMN "SubscriptionHistory".razorpay_event_id IS 'Razorpay webhook event ID';
COMMENT ON COLUMN "SubscriptionHistory".description IS 'Human-readable description of the event';
COMMENT ON COLUMN "SubscriptionHistory".metadata IS 'Additional event metadata in JSON format';
