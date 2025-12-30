function extractTweetData(apiResponse) {
  const tweets = apiResponse?.data || [];
  const media = apiResponse?.includes?.media || [];

  const mediaMap = new Map(
    media.map(m => [m.media_key, m.url])
  );

  const tweetDetailsMap = {};

  for (const t of tweets) {
    const mediaUrls = (t.attachments?.media_keys || [])
      .map(key => mediaMap.get(key))
      .filter(Boolean);

    // ✅ FORCE text to be a clean string
    const safeText =
      typeof t.text === 'string'
        ? t.text
        : JSON.stringify(t.text ?? '');

    tweetDetailsMap[t.id] = {
      text: safeText,
      media: mediaUrls.length ? JSON.stringify(mediaUrls) : null
    };
  }

  return tweetDetailsMap;
}

module.exports = { extractTweetData };
