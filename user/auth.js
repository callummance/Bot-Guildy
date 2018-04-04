const winston = require("winston");
const fs = require("fs");

const login = require("../facebook/login");
const register = require("../discord/register");
const groups = require("../facebook/groups");
const conf = require("../config/conf");

var registeredUsers = {};

module.exports.processResponse = (resp, dClient) => {
    if ("code" in resp && "state" in resp){
        login.upgradeCode(resp.code, resp.state, (access_token) => {
            login.getUserDetails(access_token, resp.state, (user_details) => {
                groups.checkUser(user_details.id, access_token, (isValid) => {
                    if (isValid) {
                        console.log(isValid);
                        addUser(resp.state, user_details);
                        register.registerUser(dClient, did);
                    } else {
                        winston.log("warning", "Unhandled registration failed");
                    }
                });
            });
        });
        return true;
    }  else {
        winston.log("warning", `Got a failed signin for uid ${did}`);
        return false;
    }
};

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
