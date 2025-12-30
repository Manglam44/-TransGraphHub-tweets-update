const connection = require('../../config');

function getHandlerMeta(username) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT userID, username, displayName, commodity
      FROM wp_handlers
      WHERE username = ?
      LIMIT 1
    `;

    connection.query(sql, [username], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}

module.exports = { getHandlerMeta };
