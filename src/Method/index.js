const connection = require('../../config');

function fetchHandlersName() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT username
      FROM wp_handlers
      WHERE
        last_fetched IS NULL
        OR DATE(last_fetched) < CURDATE()
      ORDER BY last_fetched ASC
      LIMIT 60
    `;

    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results.map(r => r.username));
    });
  });
};

async function fetchAllHandlers() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM wp_handlers";

    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};


module.exports = { fetchHandlersName, fetchAllHandlers };
