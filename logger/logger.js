const Winston = require("winston");

module.exports = new (Winston.Logger)({
    transports: [
        new (Winston.transports.Console)({
            timestamp: () => { return new Date(); },
            formatter: (options) => { return `${options.timestamp()}: ${options.message}`; }
        })
    ]
});