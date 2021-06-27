const id = require('../../id.json'),
    { MessageEmbed } = require("discord.js");

module.exports.run = (client, message) => {
    const args = message.content.split(' '),
        mention = args.length > 1 && args[1].match(/<?@?!?(\d{17,19})>?/) ? args[1].replace('<@', '').replace('!', '').replace('>', '') : null;

    message.channel.send({
        content: mention != null ? `<@${mention}>,` : undefined,
        embeds: [
            new MessageEmbed()
                .setTitle('MEE6 Roles:')
                .setColor('BLURPLE')
                .setAuthor('MEE6', 'https://cdn.discordapp.com/avatars/159985870458322944/b50adff099924dd5e6b72d13f77eb9d7.png')
                .setDescription(`Check your level by using the \`!rank\` command in <#${id.channels['bot-comamnds']}>`)
                .addField('How it works:', 'Every minute that you\'re messaging, you randomly gain between 15 and 25 XP. \n\nTo avoid spamming, earning XP is limited to once a minute per user.')
                .addField('Level 5:', `<@&${id.roles.novice}> \n> ► Access to market/trading related channels. \n> ► Additional media/link perms.`, true)
                .addField('Level 15:', `<@&${id.roles.active}> \n> ►`, true)
                .addField('Level 30:', `<@&${id.roles.devoted}> \n> ► Additional VC perms.`, true)
                .addField('Level 45:', `<@&${id.roles.legendary}> \n> ► Additional chat perms.`, true)
                .addField('Level 60:', `<@&${id.roles.nolife}> \n> ►`, true)
                .addField('Level 75:', `<@&${id.roles.godly}> \n> ►`, true)
                .addField('Level ??:', `<@&${id.roles.ascended}> \n> ► ??`, true)
                .setTimestamp()
        ]
    });
}

module.exports.config = {
    name: 'roles',
}