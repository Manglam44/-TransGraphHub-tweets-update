const { getTweetsFromXapi } = require('../API');
const { saveTweets } = require('./savedTweets');
const { getHandlerMeta } = require('./getHandlerMeta');
const { extractTweetData } = require('../Helper/extractTweetData');
const connection = require('../../config');

async function processTwitterBatch(users = []) {
  if (!users.length) {
    console.log('[CRON] No users to process');
    return;
  }

  const BATCH_LIMIT = 60;
  const batch = users.slice(0, BATCH_LIMIT);
  console.log('batch: ', batch);
  for (const username of batch) {
    try {
      // 1️⃣ Handler meta
      const handler = await getHandlerMeta(username);
      if (!handler) {
        console.log(`Handler not found: ${username}`);
        continue;
      }

      // 2️⃣ API CALL (this defines "fetched")
      const apiResponse = await getTweetsFromXapi(username);

      // ✅ UPDATE FETCH TIME immediately after successful API call
      connection.query(
        'UPDATE wp_handlers SET last_fetched = NOW() WHERE userID = ?',
        [handler.userID],
        (err) => {
          if (err) {
            console.error('DB update failed:', err.message);
          }
        }
      );

      const tweets = apiResponse?.data || [];

      // 3️⃣ No tweets is NOT an error
      if (!tweets.length) {
        console.log(`Fetched successfully, no tweets for ${username}`);
        continue;
      }

      // 4️⃣ Process tweets
      const tweetDetailsMap = extractTweetData(apiResponse);
      await saveTweets(handler, tweets, tweetDetailsMap);

      console.log(`✅ Done: ${username}`);

    } catch (err) {
      console.error(`❌ Failed for ${username}:`, err.message);

      // ❌ Do NOT update last_fetched on failure
      if (err.response?.status === 429) {
        console.warn('Rate limit hit — stopping batch');
        break;
      }
    }
  }
}


module.exports = { processTwitterBatch };
