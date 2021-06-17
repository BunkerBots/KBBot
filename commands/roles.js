const id = require('../id.json'),
    { MessageEmbed } = require("discord.js");

module.exports.run = (client, message) => {
    const args = message.content.split(' '),
        mention = args.length > 1 && args[1].match(/<?@?!?(\d{17,19})>?/) ? args[1].replace('<@', '').replace('!', '').replace('>', '') : null;

    message.channel.send(mention != null ? `<@${mention}>,` : '', {
        embed: new MessageEmbed()
            .setTitle('MEE6 Roles:')
            .setColor('BLURPLE')
            .setAuthor('MEE6', 'https://cdn.discordapp.com/avatars/159985870458322944/b50adff099924dd5e6b72d13f77eb9d7.png')
            .setDescription(`Check your level by using the \`!rank\` command in <#${id.channels['bot-comamnds']}>`)
            .addField('How it works:', 'Every minute that you\'re messaging, you randomly gain between 15 and 25 XP. \n\nTo avoid spamming, earning XP is limited to __*once*__ a minute per user.')
            .addField('Level 10:', `<@&${id.roles.beginner}> \n► Additional media/link perms.`, true)
            .addField('Level 20:', `<@&${id.roles.novice}>`, true)
            .addField('Level 30:', `<@&${id.roles.active}> \n► Additional VC perms [Streaming/Video].`, true)
            .addField('Level 40:', `<@&${id.roles.apprentice}> \n► Additional channel access [Special channel and VC].`, true)
            .addField('Level 50:', `<@&${id.roles.devoted}> \n► Additional chat perms [Reactions]`, true)
            .addField('Level 60:', `<@&${id.roles.legendary}>`, true)
            .addField('Level 70:', `<@&${id.roles.mythical}>`, true)
            .addField('Level 80:', `<@&${id.roles.nolife}>`, true)
            .addField('Level 90:', `<@&${id.roles.godly}>`, true)
            .addField('Level 100:', `<@&${id.roles.ascended}>`, true)
            .setTimestamp()
    });
}

module.exports.config = {
    name: 'roles',
}