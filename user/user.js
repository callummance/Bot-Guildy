const Logger = require("../logger/logger");
const fs = require("fs");
const promiseRetry = require("promise-retry");

const conf = require("../config/conf");

module.exports.addRoleByUserId = (rolename, id, client) => {
  var MAX_RETRIES = 5;
  var role = getRoleByName(rolename, client);
  client.guilds.get(conf().Discord.GuildId).fetchMember(id)
    .then((member) => {
        let roles = Array.from(member.roles.values()).map(role => role.name);
        if (!roles.includes(rolename)) {

          promiseRetry(function(retry, number) {

          return member.addRole(role.id)
                    .then( (result) => Logger.log("info", `Gave user ${member.user.username} the role ${rolename}`),
                           (err) => { Logger.log("info", "Could not assign role"); retry(err);} );
          }, {retries: MAX_RETRIES})
          .catch((err) => Logger.log("info", err));
        }
    });
};

function getRoleByName(rolename, client) {
  var guild = client.guilds.get(conf().Discord.GuildId);
  var role = Array.from(guild.roles.values()).find(role => role.name === rolename);
  return role;
}
