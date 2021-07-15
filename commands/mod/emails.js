const { MessageEmbed } = require("discord.js");

const emails = [
    ['**• krunker@yendis.ch**', '> For in game monetary transaction issues, KR related scams, and bugs.'],
    ['**• recovery@yendis.ch**', '> For account recovery if you\'ve lost your password. Proof of account ownership is __**required**__.'],
    ['**• appeals@yendis.ch**', '> For in game ban appeals.'],
];

module.exports.run = (client, message) => {
    const args = message.content.split(' '),
        full = args[0] == 'emails' ? 1 : 2,
        mention = (args.length > full && args[full].match(/<?@?!?(\d{17,19})>?/)) ? args[full].replace('<@', '').replace('!', '').replace('>', '') : null,
        emailsToShow = full == 1 ? [1, 1, 1] : [
            args[1] == 1 ? 1 : 0,
            args[1] == 2 ? 1 : 0,
            args[1] == 3 ? 1 : 0,
        ],
        embed = new MessageEmbed()
            .setTitle('**What email should I contact for support?**')
            .setColor('GREEN')
            .setTimestamp();

    for (let i = 0; i < emailsToShow.length; i++) {
        if (emailsToShow[i] == 1) embed.addField(emails[i][0], emails[i][1]);
    }

    message.channel.send({
        content: mention != null ? `<@${mention}>,` : undefined,
        embeds: [ embed ]
    });
}

module.exports.config = {
    name: 'emails',
}