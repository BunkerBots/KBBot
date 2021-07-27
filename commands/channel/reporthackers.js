const delay = require('delay');

const id = require('../../id.json'),
    { MessageEmbed } = require('discord.js'),
    logger = require('../../logger'),
    rules = {
        social: 'Reports must include their **social profile link**. Acceptable urls: \n - https://kr.social/p/ \n - https://krunker.io/social.html?p=profile&q=',
        video: 'Reports must include a **YouTube** video, a **Streamable** video, a **Loom** video, or a **Twitch** clip when submitting a report. We will only accept video evidence from those platforms. \n - Reports with videos uploaded to any other video sharing platform will be deleted. \n - If your video or clip is deleted and is unavailable in the future, users that you reported may be unflagged.',
    },
    socials = [
        'https://kr.social/p/',
        'https://krunker.io/social.html?p=profile&q=',
    ],
    videos = [
        'https://www.youtube.com/watch?v=',
        'https://youtu.be/',
        'https://streamable.com/',
        'https://www.loom.com/share/',
        'https://clips.twitch.tv/',
        'https://www.twitch.tv/',
    ];

module.exports.run = (client, message) => {
    var canBypass = false;
    if (!canBypass) client.roles.staff.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
    if (!canBypass) {
        let rulesBroken = '';
        if (socials.every(domain => !message.content.includes(domain))) rulesBroken += `► ${rules.social} \n`;
        if (videos.every(domain => !message.content.includes(domain))) rulesBroken += `► ${rules.video}`;
        if (rulesBroken != '') {
            message.channel.send({
                content: `<@${message.author.id}>,`, embeds: [
                    new MessageEmbed()
                        .setTitle('Please make sure you read the rules about submitting a report')
                        .setColor('ORANGE')
                        .setDescription('Your report has broken the following rule(s): \n' + rulesBroken)
                        .setTimestamp()
                ]
            }
            ).then(msg => { delay(90000).then(() => msg.delete()) }).catch(console.error);
            logger.messageDeleted(message, 'Hacker Report - Missing required info', 'RED');
        } else {
            message.channel.send({
                content: `<@${message.author.id}>,`,
                embeds: [
                    new MessageEmbed()
                        .setTitle('Thank you')
                        .setColor('GREEN')
                        .setDescription('Your report has been submitted for review. Thank you for the report.')
                        .setTimestamp()
                ]
            }
            ).then(msg => { delay(20000).then(() => msg.delete()).catch(console.error); })
            client.channels.cache.get(id.channels["hacker-reports"]).sendEmbed(new MessageEmbed()
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                .setColor('BLURPLE')
                .addField('► Content: ', message.content)
                .setFooter('Rush got salty so now his name is here :)')
                .setTimestamp());
            logger.messageDeleted(message, 'Hacker Report - Report processed', 'GREEN');
        }
    }
}

module.exports.config = {
    name: 'reporthackers',
}