const winston = require("winston");

const server = require("./webserver/server");
const conf = require("./config/conf.js");
const discord = require("./discord/init");
const connect = require("./discord/connect");
const auth = require("./user/auth");

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason.stack);
    // application specific logging, throwing an error, or other logic here
});

// Load user Configuration
try {
    conf("./conf.json");
} catch (err) {
    winston.log("error", err);
    process.exit(-1);
}

//Connect to Discord
var clientPromise = discord.connect();

//Load user list
auth.loadUsers();

//Start listening on port 8080
server.startServer(clientPromise);

//Connect bot to a server
clientPromise.done(function(client) {
    //connect.connectNewServer(client.user.id, "8");
});


