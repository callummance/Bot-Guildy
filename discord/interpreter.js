const Promise = require("promise");

const conf = require("../config/conf");
const auth = require("../user/auth");

module.exports.handleCom = (message, client) => {
    var command = message.cleanContent.split(' ');
    switch (command.shift()) {
        case "!whois":
            var nick = command.join(' ');
            findUid(nick, client).then((id) => {
                if (id === -1) {
                    message.channel.sendMessage("I couldn't find such a user. You clearly don't love twintails enough.");
                } else if (id === -2) {
                    message.channel.sendMessage("There were multiple matches for that nickname. This is disconcerting.");
                } else {
                    var realName = auth.getRealName(id);
                    message.channel.sendMessage(`${nick}'s real name is ${realName}.`);
                }
            })
    }
};

function findUid(name, client) {
    return new Promise((resolve, reject) => {
        var guild = client.guilds.get(conf().Discord.GuildId);
        var ulist = guild.fetchMembers();
        ulist.then((guild) => {
            var matches = guild.members.filter((member) => {
                return member.nickname == name || member.user.username == name;
            });
            if (matches.size > 1) {
                resolve(-2);
            } else if (matches.size == 0) {
                resolve(-1);
            } else {
                resolve(matches.first().id);
            }
        });
    });
}