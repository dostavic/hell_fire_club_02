-- Create chat_histories table for storing AI chat conversations per user
CREATE TABLE IF NOT EXISTS chat_histories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chat_id VARCHAR(255) NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chat_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_histories_user_chat ON chat_histories(user_id, chat_id);