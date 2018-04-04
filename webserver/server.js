const http = require('http');
const url = require("url");
const winston = require("winston");

const auth = require("../user/auth");
const conf = require("../config/conf");

module.exports.startServer = function(dClient) {
    winston.log("debug", "Creating server object...");
    const server = http.createServer((req, res) => {requestHandler(req, res, dClient);});

    server.listen(conf().Web.Port, (err) => {
        if (err) {
            winston.log("error", "Could not start listening for connections due to error " + err);
            return err
        }
        winston.log("info", `server is listening on port ${conf().Web.Port}`)
    });
};

const requestHandler = function(req, resp, dClient) {
    var uri = url.parse(req.url, true);
    var path = uri.pathname.split('/');
    switch (path[1]){
        case "register":
            winston.log("info", `Got signin response for uid ${path[2]}`);
            let processResult = auth.processResponse(uri.query, dClient);
            console.log("result" + processResult);
            if (path[2] !== undefined && processResult) {
                //Respond to client
                resp.statusCode = 200;
                resp.end(`
<html>
<head>
<title>ICAS Discord registration</title>
</head>

<body>
<h1 style = "font-family: sans-serif; text-align: center;">
We've got your Facebook login, you will recieve confirmation in Discord when we're done processing it.
</h1>
<p style = "font-family: sans-serif; text-align: center">
Here's something to amuse you in the mean-time...
</p>
<script>
window.setTimeout(function() {
    window.location = "http://hestia.dance";
}, 7000);
</script>
</body>
</html>`);
            } else {
                resp.statusCode = 403;
                resp.end(`
<html>
<head>
<title>ICAS Discord registration</title>
</head>

<body>
<h1 style = "font-family: sans-serif; text-align: center;">
Oh dear...
</h1>
<p style = "font-family: sans-serif; text-align: center">
Something went wrong, please contact an administrator.
</p>
</body>
</html>`);
            }

        default:
            winston.log("warning", `No handler exists for request ${path}`);
            resp.statusCode = 404;
            resp.end("uwotm8");
    }
};
