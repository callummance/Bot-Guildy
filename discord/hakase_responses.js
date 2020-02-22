const Logger = require("../logger/logger");
const request = require('request');


module.exports.interpretHakaseQuery = (client, message) => {
    if (message.cleanContent == "meow" || message.cleanContent.includes("nya")) {
        Logger.log("info", "Received meow request");
        message.channel.sendMessage("https://tinyurl.com/y2mlo33q");
    } else if (message.cleanContent == "dance") {
        Logger.log("info", "Received dance request");
        message.channel.sendMessage("https://tinyurl.com/yyulqpeg");
    } else if (message.cleanContent == "shark") {
        Logger.log("info", "Received shark request");
        message.channel.sendMessage("https://tinyurl.com/yybbw6au");
    } else if (message.cleanContent.toLowerCase().includes("sleep")) {
        Logger.log("info", "Received sleep request");
        message.channel.sendMessage("But I don't wanna!\nhttps://tinyurl.com/y5xmjyuo");
    } else if (message.cleanContent.toLowerCase().match(/(G|g)ood bot.?/)) {
        return;
    } else if (message.cleanContent.startsWith("Hakase is")) {
        if (containsPraiseWords(message.cleanContent) && !containsBlameWords(message.cleanContent)) {
            message.channel.sendMessage("https://tinyurl.com/y4bbtkl5");
        } else {
            message.channel.sendMessage("https://tinyurl.com/y2qev36j");
        }
    } else if (message.cleanContent.toLowerCase() == "jankenpon") {
        let clips = [
            "https://gfycat.com/saltyunfoldedechidna",
            "https://gfycat.com/sarcasticconsciousivorybilledwoodpecker",
            "https://gfycat.com/heartysolidanchovy",
            "https://gfycat.com/livetenseelephantseal",
            "https://gfycat.com/pinkcheapgermanshorthairedpointer",
            "https://gfycat.com/presentdefiantbantamrooster",
        ];
        let random = Math.floor(Math.random() * clips.length);
        let outcome = clips[random];
        message.channel.sendMessage(outcome);
    } else if (message.cleanContent.toLowerCase() == "play that funky music") {
        message.channel.sendMessage("https://youtu.be/WP6DJfhPQTg");
    } else {
        Logger.log("info", "Received unknown request. Searching Gfycat...");
        let urlQuery = encodeURI("anime " + message);
        request('https://api.gfycat.com/v1/gfycats/search?search_text=' + urlQuery, { json: true }, (err, res, body) => {
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

function containsPraiseWords(message) {
    const praiseWords = ["cute", "kawaii", "good", "great", "amazing", "excellent"];
    return containsWordsWithNoNegation(message, praiseWords);
}

function containsBlameWords(message) {
    const blameWords = ["bad", "crap", "shit", "broken"];
    return containsWordsWithNoNegation(message, blameWords)
}

function containsWordsWithNoNegation(message, words) {
    let messageWords = message.toLowerCase().split(" ");
    let prevWord = "";
    for (messageWord of messageWords) {
        if (words.includes(messageWord) && prevWord != "not" && prevWord != "no") {
            return true;
        } else {
            prevWord = messageWord;
        }
    }
    return false;
}