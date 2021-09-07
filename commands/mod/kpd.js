const { MessageEmbed } = require("discord.js");
const id =  require('../../id.json');

module.exports.run = (client, message) => {
    const args = message.content.split(' '),
        mention = args.length > 1 && args[1].match(/<?@?!?(\d{17,19})>?/) ? args[1].replace('<@', '').replace('!', '').replace('>', '') : null;

    message.channel.send({
        content: mention != null ? `<@${mention}>,` : undefined,
        embeds: [ new MessageEmbed()
            .setTitle('Do you require KPD assistance?')
            .setColor('ORANGE')
            .setDescription([
                `In order to get help from KPD, please call them in game.`,
                `Alternatively, you can record video evidence of the suspected cheater and submit the video via <#${id.channels['report-hackers']}>`
            ].join(' '))
            .addField('Appeals:', 'KPD do not handle ban appeals. Please email `appeals@yendis.ch` instead.')
            .addField('Boosters:', 'KPD does not handle boosters. Please email `krunker@yendis.ch` instead')
            .setTimestamp()
        ]
    });
}

module.exports.config = {
    name: 'kpd',
}