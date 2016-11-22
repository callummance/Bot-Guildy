const Discord = require("discord.js");
const Winston = require("winston");
const Promise = require("promise");

const conf = require("../config/conf");
const login = require("../user/auth");


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
            resolve(client);
        });

       //When a member joins the server
        client.on("guildMemberAdd", function(guild, newMember) {
            var loginUri = login.getLoginUri(newMember.user.id);
            var message = `Welcome to the server, ${newMember.nickname}!

Registration and therefore entry into the other channels is currently limited to members of the ICAS Facebook group, in\
an attempt to prevent spammers from gaining entry. To register, please click on the following link and login to your\
Facebook account:

${loginUri}

If you are not a member of our Facebook group but still think you belong here, please message a \
${module.exports.admin.toString()} member.
Your personal details (with the exception of your Facebook name and id) will not be stored. Have fun and happy memeing!

            -Bot Guildy`;
            newMember.sendMessage(message);
        });

        client.on("message", function(message) {
            if (message.cleanContent == "TAIL ON!") {
                var newMember = message.author;
                var loginUri = login.getLoginUri(newMember.id);
                var message = `Welcome to the server, ${newMember.username}!

Registration and therefore entry into the other channels is currently limited to members of the ICAS Facebook group, in\
an attempt to prevent spammers from gaining entry. To register, please click on the following link and login to your\
Facebook account:

${loginUri}

If you are not a member of our Facebook group but still think you belong here, please message a \
${module.exports.admin.toString()} member.
Your personal details (with the exception of your Facebook name and id) will not be stored. Have fun and happy memeing!

            -Bot Guildy`;
                newMember.sendMessage(message);

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