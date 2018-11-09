const Promise = require("promise");
const Logger = require("../logger/logger");

const conf = require("../config/conf");
const auth = require("../user/auth");
const userfunction = require("../user/user");

module.exports.handleCom = (message, client) => {
    var command = message.cleanContent.split(' ');
    var op = command.shift();
    switch (op) {
        case "!whois":
            var nick = command.join(' ');
            Logger.log("info", `Now executing whois query on user ${nick}`);
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
                message.channel.sendMessage(`Only ${conf().Discord.AdminRole} members are allowed to use this command.`)
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
                Logger.log("info", `There was an attempt to add an invalid user: ${nick}`);
                message.channel.sendMessage(`There was an attempt to add an invalid user: ${nick}`);
                return;
            }
            Logger.log("info", `Now attempting to insert new user ${nick}`);
            if (message.mentions.users.size > 0) {
                var messageMentions = message.mentions;
                if (messageMentions.users.size > 1) {
                    Logger.log("info", "Too many users mentioned.")
                    message.channel.sendMessage("Please only supply one user.")
                    return;
                }
                for (let [id, user] of messageMentions.users) {
                    var user_details = {name: name} ;
                    auth.addUser(id, user_details);
                    userfunction.addRoleByUserId(conf().Discord.MemberRole, id, client);
                }
                message.channel.sendMessage("Command completed.");
            } else {
                findUid(nick, client).then((id) => {
                    if (id === -1) {
                        message.channel.sendMessage("I couldn't find such a user. You clearly don't love twintails enough.");
                        return;
                    } else if (id === -2) {
                        message.channel.sendMessage("There were multiple matches for that nickname. Please use the @ mention.");
                        return;
                    } else {
                        var user_details = {name : name} ;
                        auth.addUser(id, user_details);
                        userfunction.addRoleByUserId(conf().Discord.MemberRole, id, client);
                        message.channel.sendMessage("Command completed.");
                    }
                });
            }
            break;
        case "!list_users":
            var roles = Array.from(message.member.roles.values()).map(role => role.name);
            if (! roles.includes(conf().Discord.AdminRole)) {
                message.channel.sendMessage(`Only ${conf().Discord.AdminRole} allowed to use this command.`)
                return;
            }
            Logger.log("info", "displaying all users in registeredUsers collection");
            var output = JSON.stringify(auth.getUsers(), null, 4);
            var DISCORD_TEXT_LIMIT = 2000;
            while (output.length > DISCORD_TEXT_LIMIT) {
              message.channel.sendMessage(output.substring(0, DISCORD_TEXT_LIMIT-1));
              output = output.substring(DISCORD_TEXT_LIMIT);
            }
            message.channel.sendMessage(output);
            break;
        case "!delete_user":
            var nick = command.join(' ');
            nick = nick.trim();
            var roles = Array.from(message.member.roles.values()).map(role => role.name);
            if (! roles.includes(conf().Discord.AdminRole)) {
                message.channel.sendMessage(`Only ${conf().Discord.AdminRole} allowed to use this command.`)
                return;
            }
            Logger.log("info", `About to delete user ${nick}`);
            if (message.mentions.users.size > 0) {
                var messageMentions = message.mentions;
                if (messageMentions.users.size > 1) {
                    Logger.log("info", "Too many users mentioned.")
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
        case "!register":
            Logger.log("info", "Received register request")
            var params = command.join(' ').split(',');
            var realName = params[0];
            var identification = "";
            if (params.length > 1) {
                identification = params[1];
            }
            if (realName === "") {
                message.channel.sendMessage("Please provide a real name");
                return;
            }
            var blacklist = ["Bot Guildy", "@Bot Guildy"];
            if (blacklist.includes(nick)) {
                Logger.log("info", `There was an attempt to register an invalid user: ${nick}`);
                message.channel.sendMessage(`There was an attempt to add an invalid user: ${nick}`);
                return;
            }
            var channelName = conf().Discord.AdminChannel;
            findChannel(channelName, client).then((channel) => {
                if (!channel) {
                    Logger.log("info", `Could not find channel: ${channelName}`)
                } else {
                    Logger.log("info", "Admin channel found. Sending message...")
                    channel.sendMessage(`New user ${message.author.username} (real name apparently ${realName}, identification provided: ${identification}) has requested to join the server`);
                    message.channel.sendMessage(
`Thanks for registering! A ${conf().Discord.AdminRole} member should review your request shortly.
If your roles do not change within the next hour, feel free to PM a ${conf().Discord.AdminRole}`);
                }
            })

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
                Logger.log("info", `Found matching id: ${matches.first().id}`);
                resolve(matches.first().id);
            }
        });
    });
}

function findChannel(channelName, client) {
    Logger.log("info", `Looking for channel: ${channelName}`);
    return new Promise((resolve, reject) => {
        var guild = client.guilds.get(conf().Discord.GuildId);
        var matches = guild.channels.filter(channel => channel.name === channelName);
        if (matches.size !== 1) {
            resolve(undefined);
        } else {
            resolve(matches.first());
        }
    });
}

