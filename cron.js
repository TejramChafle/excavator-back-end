
const cron = require("node-cron");
const push = require('./routes/push');

// Schedule send notification on every 15 min 
cron.schedule("*/1 * * * *", function() {
    // push.sendMail();
    console.log('This message will be printed every minute : ', new Date());
});

// Send events notification to the user before every 15 min
cron.schedule("*/15 * * * *", function () {
    sendEventNotifications();
});