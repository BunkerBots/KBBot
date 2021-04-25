const config = require('../config.json'),
    id = require('../id.json'),
    { MessageEmbed } = require("discord.js");

const rules = [
    ['', ''],
    ['No harassment, impersonation, hate speech, or toxic behaviour.', 'Do not spread toxicity or bully other members. Racism, sexism, homophobia, and harassment will not be tolerated in DMs or in this server.'],
    ['Do not spam.', 'Posting large copypastas or joining in with chains will be counted as spam. We do not allow epileptic/flashing content. Do not play loud noises and use voice changers in VCs.'],
    ['NSFW content, and suspicious activities.', 'Do not post NSFW content such as nudity or gore, and do not engage in discussion about sexual or disturbing topics.'],
    ['Religious and political discussions.', 'Do not spread religious or political ideas no matter their intent. Being insensitive towards others and using religious words, phrases, or references as jokes is not allowed.'],
    ['Use appropriate channels and do not advertise.', 'Do not DM people links to anything without consent. Do not advertise anything outside of the appropriate channels. #server-guide has information about the different channels.'],
    ['Do not attempt to bypass punishments.', 'Do not attempt to bypass the filters in any way, this includes using spoiler tags to fake a banned word. Adding alt accounts to the server is not allowed.'],
    ['Hacks, cheats, and exploits.', 'Showcasing or using hacks, and joining servers that distribute hacks will result in a ban. Do not share any exploits in Krunker and do not joke about hacks.'],
    ['Use an appropriate nickname and avatar.', 'Your username must be 3 or more english letters and must comply with server rules. NSFW profile pictures are against server rules.'],
    ['Do not ask users for personal information.', 'Do not ask people for their real name, age, location, or any other identifying information.'],
    ['Discord Community Guidelines and Terms of Service.', '- https://discordapp.com/guidelines \n- https://discordapp.com/terms'],
];

module.exports.run = (client, message) => {
    const args = message.content.split(' '),
        rNum = args[0].replace(`${config.prefix}rule`, ''),
        mention = args.length > 1 && args[1].match(/<?@?!?(\d{17,19})>?/) ? args[1].replace('<@!', '').replace('>', '') : null;
    if (rNum < 1 || rNum > 10) return client.channels.resolve(id.channels['bunker-bot-commands']).send(`<@${message.author.id}> That rule doesn't exist mate.`);

    message.channel.send(mention != null ? `<@${mention}>,` : '', {
        embed: new MessageEmbed()
            .setColor('#ffd1dc')
            .setTitle(`__**Rule ${rNum}**__ - **${rules[rNum][0]}**`)
            .setDescription(`${rules[rNum][1]}`)
            .setTimestamp()
    });

    if (rNum == 8 && mention != null) message.guild.members.resolve(mention).setNickname('Rule 8');
}

module.exports.config = {
    name: 'rules',
}