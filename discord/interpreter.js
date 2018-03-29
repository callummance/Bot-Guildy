const Promise = require("promise");
const Winston = require("winston");

const conf = require("../config/conf");
const auth = require("../user/auth");

module.exports.handleCom = (message, client) => {
    var command = message.cleanContent.split(' ');
    var op = command.shift();
    switch (op) {
        case "!whois":
            var nick = command.join(' ');
            Winston.log("info", `Now executing whois query on user ${nick}`);
            if (nick == "Bot Guildy") {
                message.channel.sendMessage(`${nick}'s real name is Tail Purple.`)
                return;
            }
            findUid(nick, client).then((id) => {
                if (id === -1) {
                    message.channel.sendMessage("I couldn't find such a user. You clearly don't love twintails enough.");
                } else if (id === -2) {
                    message.channel.sendMessage("There were multiple matches for that nickname. This is disconcerting.");
                } else {
                    var realName = auth.getRealName(id);
                    message.channel.sendMessage(`${nick}'s real name is ${realName}.`);
                }
            });
            break;
        case "!insert_user":
            var roles = Array.from(message.member.roles.values()).map(role => role.name);
            if (! roles.includes(conf().Discord.AdminRole)) {
                message.channel.sendMessage("Only committee members are allowed to use this command.")
                return;
            }
            var params = command.join(' ').split(',');
            if (params.length !== 2) {
                message.channel.sendMessage("Incorrect number of arguments. Please supply arguments as [discord name], [real name]");
                return;
            }
            var nick = params[0];
            var name = params[1];
            name = name.trim();
            var blacklist = ["Bot Guildy", "@Bot Guildy"];
            if (blacklist.includes(nick)) {
                Winston.log("info", `There was an attempt to add an invalid user: ${nick}`);
                message.channel.sendMessage(`There was an attempt to add an invalid user: ${nick}`);
                return;
            }
            Winston.log("info", `Now attempting to insert new user ${nick}`);
            if (message.mentions.users.size > 0) {
                var messageMentions = message.mentions;
                if (messageMentions.users.size > 1) {
                    Winston.log("info", "Too many users mentioned.")
                    message.channel.sendMessage("Please only supply one user.")
                    return;
                }
                for (let [id, user] of messageMentions.users) {
                    var user_details = {name: name} ;
                    auth.addUser(id, user_details);
                }
                message.channel.sendMessage("Command completed.");
            } else {
                findUid(nick, client).then((id) => {
                    if (id === -1) {
                        message.channel.sendMessage("I couldn't find such a user. You clearly don't love twintails enough.");
                    } else if (id === -2) {
                        message.channel.sendMessage("There were multiple matches for that nickname. Please use the @ mention.");
                    } else {
                        var user_details = {name : name} ;
                        auth.addUser(id, user_details);
                        message.channel.sendMessage("Command completed.");
                    }
                });
            }
            break;
        case "!list_users":
            var roles = Array.from(message.member.roles.values()).map(role => role.name);
            if (! roles.includes(conf().Discord.AdminRole)) {
                message.channel.sendMessage("Only committee members are allowed to use this command.")
                return;
            }
            Winston.log("info", "displaying all users in registeredUsers collection");
            message.channel.sendMessage(JSON.stringify(auth.getUsers(), null, 4));
            break;
        case "!delete_user":
            var nick = command.join(' ');
            nick = nick.trim();
            var roles = Array.from(message.member.roles.values()).map(role => role.name);
            if (! roles.includes(conf().Discord.AdminRole)) {
                message.channel.sendMessage("Only committee members are allowed to use this command.")
                return;
            }
            Winston.log("info", `About to delete user ${nick}`);
            if (message.mentions.users.size > 0) {
                var messageMentions = message.mentions;
                if (messageMentions.users.size > 1) {
                    Winston.log("info", "Too many users mentioned.")
                    message.channel.sendMessage("Please only supply one user.")
                    return;
                }
                for (let [id, user] of messageMentions.users) {
                    var user_details = {name: name} ;
                    auth.deleteUser(id);
                }
                message.channel.sendMessage("Command completed.");
            } else {
                findUid(nick, client).then((id) => {
                    if (id === -1) {
                        message.channel.sendMessage("I couldn't find such a user. You clearly don't love twintails enough.");
                    } else if (id === -2) {
                        message.channel.sendMessage("There were multiple matches for that nickname. Please use the @ mention.");
                    } else {
                        auth.deleteUser(id);
                        message.channel.sendMessage("Command completed.");
                    }
                });
            }
            break;
    }
};

function findUid(name, client) {
    return new Promise((resolve, reject) => {
        var guild = client.guilds.get(conf().Discord.GuildId);
        var ulist = guild.fetchMembers();
        if (name.charAt(0) == '@') {
            name = name.substring(1);
        }
        ulist.then((guild) => {
            var matches = guild.members.filter((member) => {
                return member.nickname == name || member.user.username == name;
            });
            if (matches.size > 1) {
                resolve(-2);
            } else if (matches.size == 0) {
                resolve(-1);
            } else {
                Winston.log("info", `Found matching id: ${matches.first().id}`);
                resolve(matches.first().id);
            }
        });
    });
}
