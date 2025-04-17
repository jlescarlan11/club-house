const { Client } = require("pg");
require("dotenv").config();

const SQL = `
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(511) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    membership_status VARCHAR(255) CHECK (membership_status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    message_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_messages (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES messages(message_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, message_id)
);

CREATE INDEX IF NOT EXISTS user_messages_user_idx ON user_messages(user_id);
CREATE INDEX IF NOT EXISTS user_messages_message_idx ON user_messages(message_id);
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
