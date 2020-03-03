const Logger = require("../logger/logger");
const fs = require("fs");

const register = require("../discord/register");
const conf = require("../config/conf");

var registeredUsers = {};

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
    Logger.log("info", `Associating discord user ${did} with details ${JSON.stringify(user_details)}`);
    registeredUsers[did] = user_details;
    fs.writeFile(conf().App.UserSaveLoc, JSON.stringify(registeredUsers), (err) => {
        if (err) {
            Logger.log("warning", `Failed to save file due to error ${err}`)
        }
    });
};

module.exports.getUsers = () => {
  return registeredUsers;
};

module.exports.deleteUser = (did) => {
    Logger.log("info", `Deleting discord user ${did}`);
    delete registeredUsers[did];
    fs.writeFile(conf().App.UserSaveLoc, JSON.stringify(registeredUsers), (err) => {
        if (err) {
            Logger.log("warning", `Failed to save file due to error ${err}`)
        }
    });
};

module.exports.getNames = () => {
    let names = [];
    for (let [uid, values] of Object.entries(registeredUsers)) {
        names.push(values.name);
    }
    return names;
}
