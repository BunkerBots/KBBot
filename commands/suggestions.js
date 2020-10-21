const { MessageEmbed } = require("discord.js")

module.exports.run = (client, message) => {
    var args = message.content.split(' ');
    const sid = args.shift();
    const suggestion = args.join(' ');
    const eb = new MessageEmbed()
        .setColor('YELLOW')
        .setDescription(`${suggestion} \n\n - Suggested by <@${sid}>`)
    message.channel.send(eb).then(sentEmbed => {
        sentEmbed.react("👍").then(() => {
            sentEmbed.react("👎");
        })
    });
    message.delete();
}

module.exports.config = {
    name: 'suggestions',
    aliases: ['sug'],
}
module.exports.help = {
    usage: '',
    User: 0,
    description: ''
}
