const pool = require("./pool");

module.exports = {
  signUpUser: async (firstName, lastName, email, password) => {
    const result = await pool.query(
      `INSERT INTO users 
       (first_name, last_name, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING user_id, email`,
      [firstName, lastName, email, password]
    );
    return result.rows[0];
  },

  getUserByEmail: async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  getUserById: async (user_id) => {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);
    return result.rows[0];
  },

  updateUserMembership: async (user_id, is_member) => {
    const result = await pool.query(
      "UPDATE users SET is_member = $1 WHERE user_id = $2 RETURNING *",
      [is_member, user_id]
    );
    return result.rows[0];
  },

  createMessage: async (content) => {
    const result = await pool.query(
      "INSERT INTO messages ( content) VALUES ($1) RETURNING *",
      [content]
    );
    return result.rows[0];
  },

  createUserMessage: async (user_id, message_id) => {
    const result = await pool.query(
      "INSERT INTO user_messages (user_id, message_id) VALUES ($1, $2) RETURNING *",
      [user_id, message_id]
    );
    return result.rows[0];
  },

  getAllUserMessages: async () => {
    const { rows } = await pool.query(
      `
      SELECT u.user_id, u.first_name, u.last_name, u.username, m.message_id, m.content, m.created_at, m.updated_at
      FROM user_messages um
      LEFT JOIN users u ON um.user_id = u.user_id
      LEFT JOIN messages m ON um.message_id = m.message_id
      ORDER BY m.created_at;
      `
    );
    return rows;
  },

  updateUserAdmin: async (user_id, is_admin) => {
    const result = await pool.query(
      "UPDATE users SET is_admin = $1 WHERE user_id = $2 RETURNING *",
      [is_admin, user_id]
    );
    return result.rows[0];
  },

  getMessageById: async (id) => {
    const result = await pool.query(
      "SELECT * FROM messages WHERE message_id = $1",
      [id]
    );
    return result.rows[0];
  },

  updateMessage: async (id, content) => {
    const result = await pool.query(
      "UPDATE messages SET content = $1 WHERE message_id = $2 RETURNING *",
      [content, id]
    );
    return result.rows[0];
  },

  deleteMessage: async (id) => {
    await pool.query("DELETE FROM messages WHERE message_id = $1", [id]);
    await pool.query("DELETE FROM user_messages WHERE message_id = $1", [id]);
  },

  findUserByEmail: async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  resetPassword: async (id, password) => {
    await pool.query(
      "UPDATE users SET password = $1 WHERE user_id = $2 RETURNING *",
      [password, id]
    );
  },
};
