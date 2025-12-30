const express = require('express');
const cors = require('cors');
require('./src/Service/cron');

const { startTwitterCron, stopTwitterCron } = require('./src/Service/cron');
const { fetchAllHandlers } = require('./src/Method');
const { getUserDetailsInsertDb } = require('./src/API');

const app = express();

app.use(express.json());
app.use(cors());

app.post('/cron/start', (req, res) => {
  startTwitterCron();
  res.json({ success: true, message: 'Cron started' + new Date() });
});

app.post('/cron/stop', (req, res) => {
  stopTwitterCron();
  res.json({ success: true, message: 'Cron stopped' });
});

app.post('/add/handlers', async (req, res) => {
  const handlers = req.body;

  if (!Array.isArray(handlers) || handlers.length === 0) {
    return res.status(400).json({ message: 'Input should be a non-empty array of handlers', success: false, data: null });
  };

  for (const handler of handlers) {
    if (!handler.username || !handler.commodity) {
      return res.status(400).json({ message: 'Each handler must have username and commodity', success: false, data: null });
    }
  };

  const existingHandlers = await fetchAllHandlers();
  const existingUsernames = new Set(existingHandlers.map(h => h.username));
  const newUsernames = handlers.filter(h => !existingUsernames.has(h.username)).map(h => h);

  // CALL X API AND DB 
  const results = await getUserDetailsInsertDb(newUsernames);

  res.json({ success: true, message: 'SUCCESS', data: results });

});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});
