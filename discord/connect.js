
const open = require("open");

exports.connectNewServer = function(clientId, permissions) {
    var authUrl = "https://discordapp.com/api/oauth2/authorize?client_id=" + clientId +
        "&scope=bot&permissions=" + permissions;
    open(authUrl, function(err) {
        if (err) throw err;
    });
};