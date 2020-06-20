const conf = require("../config/conf");
const sagiri = require('sagiri');

module.exports.searchSauceNAO = async (message, client) => {
    const sauceNAO = sagiri(conf().SauceNAO.apikey);
    const image = message.attachments.first();
    let results = await sauceNAO(image.url, { mask: [5, 6, 9, 18, 34]} );
    results = results.filter(result => result.similarity >= 85);
    if (results.length == 0) {
        return;
    }
    pixivResult = results.find(result => result.site == 'Pixiv');
    if (pixivResult != undefined) {
        message.channel.sendMessage("Source: <" + pixivResult.url + ">");
        return;
    }
    results.sort(resultsCompareFn);
    message.channel.sendMessage("Source: <" + results[0].url +">");
}

function resultsCompareFn(a,b) {
    if (a.similarity > b.similarity) {
        return -1;
    }
    if (a.similarity < b.similarity) {
        return 1;
    }
    return 0;
}