const Discord = require("discord.js");
const Winston = require("winston");
const Promise = require("promise");

const conf = require("../config/conf");
const login = require("../user/auth");
const game = require("./game");
const interpreter = require("./interpreter");


exports.connect = function() {
    return new Promise(function (resolve, reject) {
        const client = new Discord.Client();

        Winston.log("info", "Connecting to Discord...");
        client.login(conf().Discord.APIKey);

        //Setting up initial connection
        client.on("ready", function() {
            Winston.log("info", "Connected to server!");
            getRoleIds(client);
            client.user.setAvatar("./images/bot guildy.png");
            game.startGameRotate(client);
            resolve(client);
        });

       //When a member joins the server
        client.on("guildMemberAdd", function(newMember) {
            var loginUri = login.getLoginUri(newMember.user.id);
            var message = `Welcome to the server, ${newMember.username}!

To complete your registration into our server please direct message Bot-Guildy with the following

!register [Your real name]

Once a ${module.exports.admin.toString()} member confirms your identity, you will be given permissions to join the other\
channels.

If you are not a member of our Facebook group but still think you belong here, please message a \
${module.exports.admin.toString()} member. Have fun and happy memeing!
            -Bot Guildy`;
            newMember.sendMessage(message);
        });

        client.on("message", function(message) {
            if (message.cleanContent == "TAIL ON!") {
                var newMember = message.author;
                var loginUri = login.getLoginUri(newMember.id);
                var message = `Welcome to the server, ${newMember.username}!

To complete your registration into our server please direct message Bot-Guildy with the following

!register [Your real name]

Once a committee member confirms your identity, you will be given permissions to join the other \
channels.

If you are not a member of our Facebook group but still think you belong here, please message a \
${module.exports.admin.toString()} member. Have fun and happy memeing!

-Bot Guildy`;
                newMember.sendMessage(message);

            } else if (message.cleanContent.charAt(0) == '!'){
                Winston.log("info", "Got a command, now executing...")
                interpreter.handleCom(message, client);
            }
        });
    });
};

function getRoleIds(client) {
    var roles = client.guilds.get(conf().Discord.GuildId).roles;
    var adminRoles = roles.filterArray((item) => {
        return item.name == conf().Discord.AdminRole;
    });
    var memberRoles = roles.filterArray((item) => {
        return item.name == conf().Discord.MemberRole;
    });

    if (memberRoles.length != 1) {
        Winston.log("error", `MemberRole setting matches incorrect number of roles: ${JSON.stringify(memberRoles)}`);
        process.exit(-1);
    } else {
        module.exports.member = memberRoles[0];
    }
    if (adminRoles.length != 1) {
        Winston.log("error", `AdminRole setting matches incorrect number of roles: ${JSON.stringify(adminRoles)}`);
        process.exit(-1);
    } else {
        module.exports.admin = adminRoles[0];
    }
}
