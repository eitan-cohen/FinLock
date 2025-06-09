
-- FinLock Database Schema
-- Run this script to initialize the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Virtual cards table
CREATE TABLE virtual_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lithic_card_id VARCHAR(255) UNIQUE NOT NULL,
    card_token VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'frozen' CHECK (status IN ('frozen', 'active', 'suspended', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL CHECK (limit_amount > 0),
    spent_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (spent_amount >= 0),
    period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- Authorization sessions table
CREATE TABLE authorization_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES virtual_cards(id) ON DELETE CASCADE,
    amount_limit DECIMAL(10,2) NOT NULL CHECK (amount_limit > 0),
    category_mcc VARCHAR(4),
    merchant_name VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed', 'cancelled', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES virtual_cards(id) ON DELETE CASCADE,
    lithic_transaction_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    merchant_name VARCHAR(255),
    merchant_mcc VARCHAR(4),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'authorized', 'settled', 'declined', 'cancelled')),
    authorization_session_id UUID REFERENCES authorization_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_virtual_cards_user_id ON virtual_cards(user_id);
CREATE INDEX idx_virtual_cards_lithic_id ON virtual_cards(lithic_card_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(user_id, category);
CREATE INDEX idx_auth_sessions_user_id ON authorization_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires ON authorization_sessions(expires_at);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_lithic_id ON transactions(lithic_transaction_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_category ON transactions(user_id, category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_virtual_cards_updated_at BEFORE UPDATE ON virtual_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_authorization_sessions_updated_at BEFORE UPDATE ON authorization_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample MCC categories for reference
CREATE TABLE mcc_categories (
    mcc_code VARCHAR(4) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

INSERT INTO mcc_categories (mcc_code, category_name, description) VALUES
('5411', 'Grocery Stores', 'Grocery stores and supermarkets'),
('5812', 'Eating Places', 'Restaurants and eating places'),
('5541', 'Service Stations', 'Gas stations and service stations'),
('5311', 'Department Stores', 'Department stores'),
('5999', 'Miscellaneous Retail', 'Miscellaneous and specialty retail stores'),
('4121', 'Taxicabs', 'Taxicabs and limousines'),
('5814', 'Fast Food', 'Fast food restaurants'),
('5912', 'Drug Stores', 'Drug stores and pharmacies'),
('5661', 'Shoe Stores', 'Shoe stores'),
('5691', 'Clothing Stores', 'Men''s and women''s clothing stores');

-- Create a view for transaction analytics
CREATE VIEW transaction_analytics AS
SELECT 
    t.user_id,
    t.category,
    DATE_TRUNC('month', t.created_at) as month,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    AVG(t.amount) as avg_amount
FROM transactions t
WHERE t.status = 'settled'
GROUP BY t.user_id, t.category, DATE_TRUNC('month', t.created_at);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO finlock_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO finlock_user;
