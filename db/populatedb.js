const { Client } = require("pg");
require("dotenv").config();

const SQL = `
-- Create users table with username column
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(511) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_member BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    message_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_messages table
CREATE TABLE IF NOT EXISTS user_messages (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES messages(message_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, message_id)
);

-- Create indexes for user_messages
CREATE INDEX IF NOT EXISTS user_messages_user_idx ON user_messages(user_id);
CREATE INDEX IF NOT EXISTS user_messages_message_idx ON user_messages(message_id);

-- Function to generate unique username
CREATE OR REPLACE FUNCTION generate_unique_username(email TEXT)
RETURNS TEXT AS $$
DECLARE
    base_username TEXT;
    new_username TEXT;
    suffix INT := 1;
BEGIN
    base_username := split_part(email, '@', 1);
    new_username := base_username;

    WHILE EXISTS (SELECT 1 FROM users WHERE username = new_username) LOOP
        new_username := base_username || suffix::TEXT;
        suffix := suffix + 1;
    END LOOP;

    RETURN new_username;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to set username before insert
CREATE OR REPLACE FUNCTION set_username_before_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.username IS NULL THEN
        NEW.username := generate_unique_username(NEW.email);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER set_username_trigger
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_username_before_insert();
`;

async function main() {
  console.log("Seeding...");

  const connectionString = process.argv[2] || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("ERROR: No connection string provided.");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  await client.query(SQL);
  await client.end();

  console.log("done.");
}

main();
