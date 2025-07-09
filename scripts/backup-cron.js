var exec = require('child_process').exec;
const cron = require('node-cron');
cron.schedule('0 3 * * *', () =>  {
    var child = exec('cp ./test.sqlite ./backup.sqlite');
});