const Logger = require("../logger/logger");
const request = require('request');


module.exports.interpretHakaseQuery = (client, message) => {
    if (message.cleanContent == "meow") {
        Logger.log("Received meow request");
        message.channel.sendMessage("https://tinyurl.com/y2mlo33q");
    } else if (message.cleanContent == "dance") {
        Logger.log("Received dance request");
        message.channel.sendMessage("https://tinyurl.com/yyulqpeg");
    } else if (message.cleanContent == "shark") {
        Logger.log("Received shark request");
        message.channel.sendMessage("https://tinyurl.com/yybbw6au");
    } else {
        Logger.log("Received unknown request. Searching Gfycat...");
        let urlQuery = encodeURI(message);
        request('https://api.gfycat.com/v1/gfycats/search?search_text=hakase%20'+urlQuery, { json: true }, (err, res, body) => {
            if (err) {
                Logger.warn(err);
                message.channel.sendMessage("Sorry Hakase is busy right now. Go ask Nano instead.");
                return;
            }
            let gifs = body["gfycats"];
            for (let gif of gifs) {
                if (gif["nsfw"] == "0") {
                    message.channel.sendMessage(gif["max5mbGif"]);
                    return;
                }
            }
        });
        
    }
}