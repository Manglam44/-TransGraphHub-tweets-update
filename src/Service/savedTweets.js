const connection = require('../../config');

async function saveTweets(handler, tweets = [], tweetDetailsMap = {}) {
  if (!handler || !tweets.length) return;

  const { userID, username, displayName, commodity, platform } = handler;

  const values = tweets.map(t => {
    const details = tweetDetailsMap[t.id] || {};

    return [
      String(t.id),                          // id
      platform || 'X.com',                   // platform
      username || null,                      // username
      displayName || null,                   // displayName
      String(details.text || t.text || ''),  // content
      t.created_at || null,                  // timestamp
      0,                                     // likes
      0,                                     // retweets
      0,                                     // replies
      0,                                     // impressions
      commodity || null,                     // commodity
      userID,                                // userId
      details.media || '',                 //  media 
      new Date()                             // last_fetched
    ];
  });

  // 🔎 Safety check (VERY IMPORTANT)
  if (!values.length || values[0].length !== 14) {
    console.error('Invalid values payload', values[0]);
    return;
  }


  // const sql = `
  //   INSERT INTO wp_twitter (
  //     id, platform, username, displayName, content,
  //     timestamp, likes, retweets, replies, impression,
  //     commodity, userId, media, last_fetched
  //   ) VALUES ?
  // `;

  const sql = `INSERT INTO wp_twitter (
                id, platform, username, displayName, content,
                timestamp, likes, retweets, replies, impression,
                commodity, userId, media, last_fetched
              ) VALUES ?
              ON DUPLICATE KEY UPDATE
                          platform = VALUES(platform),
                          username = VALUES(username),
                          displayName = VALUES(displayName),
                          content = VALUES(content),
                          timestamp = VALUES(timestamp),
                          likes = VALUES(likes),
                          retweets = VALUES(retweets),
                          replies = VALUES(replies),
                          impression = VALUES(impression),
                          commodity = VALUES(commodity),
                          userId = VALUES(userId),
                          media = VALUES(media),
                          last_fetched = VALUES(last_fetched)
                        `;

  connection.query(sql, [values], err => {
    if (err) {
      console.error('Insert tweet error:', err);
    } else {
      console.log(values.length, 'Posts stored successfully');
    }
  });

}

module.exports = { saveTweets };
