const axios = require('axios');
const { Auth } = require('../token');
const connection = require('../../config');

async function getTweetsFromXapi(username) {
  if (!username) {
    throw new Error('Username is required');
  };

  const url = `https://api.x.com/2/tweets/search/recent` +
    `?query=from:${username}` + //#oil -is:retweet
    `&tweet.fields=created_at,text` +
    `&expansions=attachments.media_keys` +
    `&media.fields=url` +
    `&max_results=10 `;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${Auth}`
    }
  });
  console.log('RES: ', response?.data);

  return response?.data;
};

async function getUserDetailsInsertDb(handlers) {

  return new Promise(async (resolve, reject) => {
    if (handlers.length == 0) {
      console.log('Error: ', 'Invalid parameters for inserting Twitter handler');
      return resolve(`No Handler is Exist For Insert Total Handlers: ${handlers.length}`);
    };

    const usernames = handlers?.map(h => h.username).join(',');
    try {
      const url = `https://api.twitter.com/2/users/by?usernames=${usernames}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${Auth}`,
          'Content-Type': 'application/json'
        }
      });
      const usersData = response?.data.data;
      // console.log('Response: ', response?.data);
      if (!usersData || usersData.length === 0 || usersData === undefined || usersData === null) {
        return reject(new Error('This is no user data found from Twitter API'));
      };
      // Create lookup map from usersData for quick access by username
      const usersMap = new Map(usersData.map(user => [user.username.toLowerCase(), user]));

      // Merge arrays based on username key
      const merged = handlers.map(item => {
        const userInfo = usersMap.get(item.username.toLowerCase()) || {};
        return { ...userInfo, ...item };
      });

      const sql = 'INSERT INTO wp_handlers (userId, username, displayName, commodity, platform, created_at, last_fetched) VALUES (?, ?, ?, ?, ?, ?, ?)';
      for (const handler of merged) {
        connection.query(sql, [handler.id, handler.username, handler.name, handler.commodity, 'X.com', new Date(), null], (err, results) => {
          if (err) {
            console.error('Error inserting Twitter handler:', err);
            reject(err + ' for username ' + handler.username);
          } else {
            resolve(results);
          }
        });
      };
    } catch (error) {
      console.log("Error: ", error.message);
      reject(error);
    }
  });
};

module.exports = { getTweetsFromXapi, getUserDetailsInsertDb };
