/**
 * Created by Callum on 22/11/2016.
 */

const conf = require("../config/conf.js");
const request = require("request");
const winston = require("winston");
const Promise = require("promise");

module.exports.getLoginUri = (uid) => {
    var clientId = conf().Facebook.AppID;
    var redirectUri = `${conf().Web.Address}:${conf().Web.Port}/register/${uid}`;
    return `https://www.facebook.com/v2.8/dialog/oauth?\
client_id=${clientId}\
&redirect_uri=${redirectUri}\
&response_type=code`;
};

module.exports.upgradeCode = (code, uid, callback) => {
    var clientId = conf().Facebook.AppID;
    var uri = `${conf().Web.Address}:${conf().Web.Port}/register/${uid}`;
    var clientSecret = conf().Facebook.AppSecret;

    var url = `https://graph.facebook.com/v2.8/oauth/access_token?\
client_id=${clientId}\
&redirect_uri=${uri}\
&client_secret=${clientSecret}\
&code=${code}`;

    winston.log("info", "Now contacting Facebook graph API for access token upgrade");
    request({
        json: true,
        url: url
    }, function (err, resp, body) {
        if (!err && resp.statusCode == 200) {
            winston.log("info", "Got access token from Facebook API. Now calling callback.");
            callback(body.access_token);
        } else {
            var jsonresp = JSON.stringify(resp);
            winston.log("error", `Token upgrade failed: response was ${jsonresp} with code ${resp.statusCode} from url ${url}`);
        }
    });
};

module.exports.getUserDetails = (tok, id, callback) => {
    var url = `https://graph.facebook.com/v2.8/me?access_token=${tok}`;
    request({
        json: true,
        url: url
    }, function (err, resp, body) {
        if (!err && resp.statusCode == 200) {
            winston.log("info", "Got user details from Facebook API. Now calling callback.");
            winston.log("debug", `recieved ${body.id}`);
            callback(body);
        } else {
            winston.log("error", `API access failed: response was ${resp} with code ${resp.statusCode} from url ${url}`);
        }
    });

};