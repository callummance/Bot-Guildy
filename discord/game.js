const schedule = require("node-schedule");

const conf = require("../config/conf");


module.exports.startGameRotate = (client) => {
    var gamesList = conf().GamesList;
    var newGameTitle = gamesList[Math.floor(Math.random()*gamesList.length)];
    client.user.setGame(newGameTitle);

    var rule = new schedule.RecurrenceRule();
    rule.hour = 23;
    schedule.scheduleJob(rule, () => {
        var gamesList = conf().GamesList;
        var newGameTitle = gamesList[Math.floor(Math.random()*gamesList.length)];

        client.user.setGame(newGameTitle);
    });

};