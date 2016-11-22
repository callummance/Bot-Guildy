
const fs = require("fs");
const winston = require("winston");

var prevLoc;
var prevConf;

module.exports = function(confLoc) {
    if ((confLoc == null || confLoc == prevLoc) && prevConf) {
        return prevConf;
    } else {
        winston.log("info", "Now loading user configuration", {
            confFile: confLoc
        });
        try {
            var conf = fs.readFileSync(confLoc);
            winston.log("info", "Configuration loaded.");
            prevLoc = confLoc;
            prevConf = JSON.parse(conf);
            return prevConf;
        } catch (e) {
            winston.log("error", "Could not read config file");
            throw e;
        }
    }
};
