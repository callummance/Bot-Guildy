const Logger = require("../logger/logger");

const conf = require("../config/conf");
const disc = require("./init.js");



module.exports.registerUser = (client, id) => {
    Logger.log("info", `Now registering user ${id}`);
    client.then((client) => {
        var userPromise = client.guilds.get(conf().Discord.GuildId).fetchMember(id);
        userPromise.then((user) => {
            var rolePromise = user.addRole(disc.member);
            rolePromise.then((role) => {
                role.sendMessage("You have been registered, have fun!");
            }, (reason) => {
                Logger.log("warning", `Could not find role ${disc.member}`)
            });
        }, (reason) => {
            Logger.log("warning", `Could not find user ${id}`)
        });
    }, (reason) => {
        Logger.log("warning", `User registration failed due to reason ${reason}`);
    });
};