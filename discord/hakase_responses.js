const Promise = require("promise");
const Logger = require("../logger/logger");

const conf = require("../config/conf");
const auth = require("../user/auth");
const userfunction = require("../user/user");
const Discord = require("discord.js");

module.exports.interpretHakaseQuery = (client, message) => {
    if (message.cleanContent.includes("HAKASE HAKASE HAKASE")) {
        message.channel.sendFile("images/hakase_says_nano.gif");
    } else {
        message.channel.sendMessage("Sorry Hakase is busy right now. Go ask Nano instead.");
    }
}