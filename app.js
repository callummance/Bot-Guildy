const winston = require("winston");

const server = require("./webserver/server");
const conf = require("./config/conf.js");
const discord = require("./discord/init");
const connect = require("./discord/connect");
const login = require("./facebook/login");

winston.level = "silly";

// Load user Configuration
try {
    conf("./conf.json");
} catch (err) {
    winston.log("error", err);
    process.exit(-1);
}

//Connect to Discord
var clientPromise = discord.connect();

//Start listening on port 8080
server.startServer(clientPromise);
console.log(login.getLoginUri("1"));

//Connect bot to a server
clientPromise.done(function(client) {
    //connect.connectNewServer(client.user.id, "8");
});


