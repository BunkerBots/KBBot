const { MessageEmbed } = require("discord.js");

module.exports.run = (client, message) => {
    const args = message.content.split(' '),
        mention = args.length > 1 && args[1].match(/<?@?!?(\d{17,19})>?/) ? args[1].replace('<@', '').replace('!', '').replace('>', '') : null;

    message.channel.send(mention != null ? `<@${mention}>,` : '', {
        embed: new MessageEmbed()
            .setTitle('**What email should I contact for support?**')
            .setColor('GREEN')
            .addField('**• krunker@yendis.ch**', '> For in game monetary transaction issues, KR related scams, and bugs.')
            .addField('**• recovery@yendis.ch**', '> For account recovery if you\'ve lost your password. Proof of account ownership is __**required**__.')
            .addField('**• appeals@yendis.ch**', '> For in game ban appeals.')
            .setTimestamp()
    });
}

module.exports.config = {
    name: 'emails',
}