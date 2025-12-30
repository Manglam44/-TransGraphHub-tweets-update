const cron = require('node-cron');
const { fetchHandlersName } = require('../Method');
const { processTwitterBatch } = require('./processTwitterBatch');

let twitterCronTask = null;

async function startTwitterCron() {
  if (twitterCronTask) {
    console.log('Twitter cron already running');
    return;
  };

  const users = await fetchHandlersName();
  await processTwitterBatch(users);

  twitterCronTask = cron.schedule(
    '*/15 * * * *',
    async () => {
      try {
        const users = await fetchHandlersName();
        await processTwitterBatch(users);
      } catch (err) {
        console.error('Cron error:', err.message);
      }
    },
    {
      scheduled: true // auto start
    }
  );

  console.log('Twitter cron started on: ', new Date());
};

function stopTwitterCron() {
  if (!twitterCronTask) {
    console.log('Twitter cron not running');
    return;
  }

  twitterCronTask.stop();
  twitterCronTask = null;

  console.log('Twitter cron stopped');
};

module.exports = {
  startTwitterCron,
  stopTwitterCron,
};
