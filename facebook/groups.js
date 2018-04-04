
const conf = require("../config/conf.js");
const request = require("request");
const winston = require("winston");

var cachedUsers = [];

module.exports.checkUser = (fid, tok, callback) => {
    winston.log("info", `Checking if user ${fid} is in the group.`);
    if (fid in cachedUsers) {
        callback(true);
        return;
    }
    winston.log("info", "User not found in cache, fetching new user list");
    var group = conf().Facebook.GroupId;
    var init_uri = `https://graph.facebook.com/v2.8/${group}/members?access_token=${tok}&limit=100`;
    getMemberPage(init_uri, fid, callback);
};

function getMemberPage(url, fid, callback) {
    request({
        json: true,
        url: url
    }, function (err, resp, body) {
        if (!err && resp.statusCode == 200 && "data" in body) {
            for (var i = 0; i < body.data.length; i++) {
                if (!body.data[i].id in cachedUsers) {
                    cachedUsers.append(body.data[i].id);
                }
                if (fid == body.data[i].id) {
                    winston.log("info", `Found user in group: ${fid}`);
                    callback(true);
                    return;
                }
            }
            if (body.paging && "next" in body.paging){
                winston.log("silly", `Got page of users: ${JSON.stringify(body)}`);
                getMemberPage(body.paging.next, fid, callback);
            } else {
                callback(false);
            }
        } else {
            winston.log("error", `API request failed: response was ${JSON.stringify(resp)} with code ${resp.statusCode} from url ${url}`);
            callback(false);
        }
    });

}
