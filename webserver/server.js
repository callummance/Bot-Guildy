const http = require('http');
const url = require("url");
const Logger = require("../logger/logger");

const auth = require("../user/auth");
const conf = require("../config/conf");

module.exports.startServer = function(dClient) {
    Logger.log("debug", "Creating server object...");
    const server = http.createServer((req, res) => {requestHandler(req, res, dClient);});

    server.listen(conf().Web.Port, (err) => {
        if (err) {
            Logger.log("error", "Could not start listening for connections due to error " + err);
            return err
        }
        Logger.log("info", `server is listening on port ${conf().Web.Port}`)
    });
};

const requestHandler = function(req, resp, dClient) {
    var uri = url.parse(req.url, true);
    var path = uri.pathname.split('/');
    switch (path[1]){
        default:
            Logger.log("warning", `No handler exists for request ${path}`);
            resp.statusCode = 404;
            resp.end("uwotm8");
    }
};
