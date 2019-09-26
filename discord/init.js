const Discord = require("discord.js");
const Logger = require("../logger/logger");
const Promise = require("promise");

const conf = require("../config/conf");
const login = require("../user/auth");
const game = require("./game");
const interpreter = require("./interpreter");
const hakase = require("./hakase_responses");

exports.connect = function() {
    return new Promise(function (resolve, reject) {
        const client = new Discord.Client();

        Logger.log("info", "Connecting to Discord...");
        client.login(conf().Discord.APIKey);

        //Setting up initial connection
        client.on("ready", function() {
            Logger.log("info", "Connected to server!");
            getRoleIds(client);
            game.startGameRotate(client);
            resolve(client);
        });

       //When a member joins the server
        client.on("guildMemberAdd", function(newMember) {
            newMember.sendMessage(welcomeMessage(newMember));
        });

        //When a member messages bot
        client.on("message", function(message) {
            if (message.cleanContent.startsWith("HAKASE HAKASE HAKASE")) {
                if (message.channel.type == "dm") {
                    var newMember = message.author;
                    newMember.sendMessage(welcomeMessage(newMember));
                } else {
                    hakase.interpretHakaseQuery(client, message);
                }
            } else if (message.cleanContent.charAt(0) == '!'){
                Logger.log("info", "Got a command, now executing...")
                interpreter.handleCom(message, client);
            }
        });
    });
};

function welcomeMessage(newMember) {
    return `Welcome to the server, ${newMember.username}!

To complete your registration into our server please direct message Hakase with the following

!register [Your real name], [Some form of identification e.g. ${conf().Verification.join()}]

Once a ${module.exports.admin.toString()} member confirms your identity, you will be given permissions to join the other\
channels. 

If your roles do not change within the hour, feel free to message a ${module.exports.admin.toString()} member.
            -Bot Guildy`;
}

function getRoleIds(client) {
    var roles = client.guilds.get(conf().Discord.GuildId).roles;
    var adminRoles = roles.filterArray((item) => {
        return item.name == conf().Discord.AdminRole;
    });
    var memberRoles = roles.filterArray((item) => {
        return item.name == conf().Discord.MemberRole;
    });

    if (memberRoles.length != 1) {
        Logger.log("error", `MemberRole setting matches incorrect number of roles: ${JSON.stringify(memberRoles)}`);
        process.exit(-1);
    } else {
        module.exports.member = memberRoles[0].name;
    }
    if (adminRoles.length != 1) {
        Logger.log("error", `AdminRole setting matches incorrect number of roles: ${JSON.stringify(adminRoles)}`);
        process.exit(-1);
    } else {
        module.exports.admin = adminRoles[0].name;
    }
}
