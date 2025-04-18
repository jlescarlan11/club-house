const pool = require("./pool");

const signUpUser = async (first_name, last_name, email, password) => {
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *`,
    [first_name, last_name, email, password]
  );
  return rows[0];
};

module.exports = { signUpUser };
