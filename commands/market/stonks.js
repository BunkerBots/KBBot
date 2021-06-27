const logger = require('../../logger'),
    id = require("../../id.json");

module.exports.run = (client, message) => {
    if (message.attachments.size == 0) { // Checks if message lacks an attachment
        message.channel.send(`<@${message.author.id}>, please include **cropped** image displaying the trade in question.`).then(msg => { 
            msg.delete({ timeout: 6000 });
        }).catch(console.error);
        return logger.messageDeleted(message, 'Invalid use of stonks command', 'PURPLE');
    }
    message.react(client.emojis.cache.get(id.emojis.yes));
    message.react(client.emojis.cache.get(id.emojis.neutral));
    message.react(client.emojis.cache.get(id.emojis.no));
}

module.exports.config = {
    name: 'stonks',
}