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
};
