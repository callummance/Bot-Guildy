
const fs = require("fs");
const Logger = require("../logger/logger");

var prevLoc;
var prevConf;

module.exports = function(confLoc) {
    if ((confLoc == null || confLoc == prevLoc) && prevConf) {
        return prevConf;
    } else {
        Logger.log("info", "Now loading user configuration", {
            confFile: confLoc
        });
        try {
            var conf = fs.readFileSync(confLoc);
            Logger.log("info", "Configuration loaded.");
            prevLoc = confLoc;
            prevConf = JSON.parse(conf);
            return prevConf;
        } catch (e) {
            Logger.log("error", "Could not read config file");
            throw e;
        }
    }
};
