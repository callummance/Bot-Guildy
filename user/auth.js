const winston = require("winston");
const fs = require("fs");

const register = require("../discord/register");
const conf = require("../config/conf");

var registeredUsers = {};

module.exports.getLoginUri = (did) => {
    return login.getLoginUri(did);
};

module.exports.loadUsers = () => {
    var loaded = fs.readFileSync(conf().App.UserSaveLoc);
    registeredUsers = JSON.parse(loaded);
};

module.exports.getRealName = (id) => {
    var user = registeredUsers[id];
    var name = user ? user.name : "undefined";
    return name;
};

module.exports.addUser = (did, user_details) => {
    winston.log("info", `Associating discord user ${did} with fb user ${JSON.stringify(user_details)}`);
    registeredUsers[did] = user_details;
    fs.writeFile(conf().App.UserSaveLoc, JSON.stringify(registeredUsers), (err) => {
        if (err) {
            winston.log("warning", `Failed to save file due to error ${err}`)
        }
    });
};

module.exports.getUsers = () => {
  return registeredUsers;
};

module.exports.deleteUser = (did) => {
    winston.log("info", `Deleting discord user ${did}`);
    delete registeredUsers[did];
    fs.writeFile(conf().App.UserSaveLoc, JSON.stringify(registeredUsers), (err) => {
        if (err) {
            winston.log("warning", `Failed to save file due to error ${err}`)
        }
    });
};
