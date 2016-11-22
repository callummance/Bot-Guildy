const winston = require("winston");
const fs = require("fs");

const login = require("../facebook/login");
const register = require("../discord/register");
const groups = require("../facebook/groups");
const conf = require("../config/conf");

var registeredUsers = {};

module.exports.processResponse = (did, resp, dClient) => {
    if ("code" in resp){
        login.upgradeCode(resp.code, did, (access_token) => {
            login.getUserDetails(access_token, did, (user_details) => {
                groups.checkUser(user_details.id, access_token, (isValid) => {
                    if (isValid) {
                        addUser(did, user_details);
                        register.registerUser(dClient, did);
                    } else {
                        winston.log("warning", "Unhandled registration failed");
                    }
                });
            });
        });
    }  else {
        winston.log("warning", `Got a failed signin for uid ${uid}`);
    }
};

module.exports.getLoginUri = (did) => {
    return login.getLoginUri(did);
}

function addUser(did, user_details) {
    registeredUsers[did] = user_details;
    fs.writeFile(conf().App.UserSaveLoc, JSON.stringify(registeredUsers));
}
