const { MessageEmbed } = require("discord.js"),
    db = require('../../app').db.moderator;

module.exports.run = async(client, message) => {
    const fetchUser = await db.get(message.content.replace('<@!', '').replace('>', '').split(' ')[1]);
    if (fetchUser) {
        message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle('Modlogs for ' + fetchUser.username)
                    .setColor('BLURPLE')
                    .setDescription('Submissions: ' + fetchUser.submissions)
                    .setTimestamp()
            ]
        });
    } else {
        message.reply(new MessageEmbed()
            .setTitle('ERROR')
            .setDescription('No modlogs exists for specified user.')
            .setTimestamp());
    }
}

module.exports.config = {
    name: 'modlogs',
}