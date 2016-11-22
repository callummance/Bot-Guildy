const Discord = require("discord.js");
const winston = require("winston");

const conf = require("../config/conf");
const disc = require("./init.js")



module.exports.registerUser = (client, id) => {
    winston.log("info", `Now registering user ${id}`);
    client.then((client) => {
        var userPromise = client.guilds.get(conf().Discord.GuildId).fetchMember(id);
        userPromise.then((user) => {
            console.log(user);
            console.log(disc.member)
            var rolePromise = user.addRole(disc.member);
            rolePromise.then((role) => {
                role.sendMessage("You have been registered, have fun!");
            });
        });
    });
};