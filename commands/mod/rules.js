const { MessageEmbed } = require("discord.js");
// new rules
const rules = [
    [,],
    ['No toxic behaviour, hate speech, or impersonation', 'Do not spread toxicity or bully other members. Racism, sexism, homophobia, and any other forms of harassment will not be tolerated in DMs or in this server.'],
    ['Do not spam, post copypastas, or join in chains', 'Posting copypastas or participating in chains will be counted as spam. We do not allow epileptic/flashing content. Do not mic-spam or use voice changers in VCs.'],
    ['NSFW content & disturbing topics are prohibited', 'Do not post NSFW content such as nudity or gore anywhere in the server. Discussion topics that may be considered sexual or disturbing are prohibited.'],
    ['Religious and political discussions are prohibited', 'Spreading religious & political ideas is not allowed. We ask users to be respectful towards all others, and insensitive comments towards others will be removed.'],
    ['Do not ask users for personal information', 'Do not ask other members for their personal information, this includes but is not limited to their real name, age, location, and any other identifying information.'],
    ['Showcasing or using hacks is prohibited', 'Showcasing or using hacks, and joining servers that distribute hacks will result in a ban. Joking about hacking is prohibited, and avoid sharing any exploits in Krunker.'],
    ['Use appropriate channels and do not advertise', 'Do not DM people links without consent, and do not advertise anything outside of the appropriate channels. <#705074841488719904> has information about our channels.'],
    ['Use an appropriate nickname, avatar, and profile', 'Your username must contain at least 3 consecutive characters typeable on a standard US keyboard. Profiles and nicknames must comply with server rules.'],
    ['Do not attempt to bypass filters & punishments', 'Do not attempt to bypass the filters in any way, this includes using spoiler tags to fake a banned word or phrase. Adding alt accounts to the server is also prohibited.'],
    ['Follow Discord Guidelines & Terms of Service', '- https://discordapp.com/guidelines \n- https://discordapp.com/terms'],
];

module.exports.run = (client, message) => {
    const args = message.content.split(' '),
        rNum = args[1],
        mention = args.length > 2 && args[2].match(/<?@?!?(\d{17,19})>?/) ? args[2].replace('<@', '').replace('!', '').replace('>', '') : null;
    if (!(rNum > 0 && rNum < 11)) return;

    message.channel.send({ 
        content: mention != null ? `<@${mention}>,` : undefined,
        embeds: [
            new MessageEmbed()
                .setTitle(`__**Rule ${rNum}**__ - **${rules[rNum][0]}**`)
                .setColor('#ffcc00')
                .setDescription(`${rules[rNum][1]}`)
        ],
    });

    if (rNum == 8 && mention != null) message.guild.members.resolve(mention).setNickname('Rule 8');
}

module.exports.config = {
    name: 'rules',
}
