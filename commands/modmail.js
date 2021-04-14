const id = require("../id.json"),
    { MessageEmbed, MessageAttachment } = require("discord.js"),
    submissions_db = require('../app').db.submissions,
    moderator_db = require('../app').db.moderator,
    logger = require("../logger");

const roles = [
    '692870902005629041', //Trial Mod
    '448207247215165451', //Mod
    '448195089471111179', //CM
    '638129127555072028', //Yendis
    '448198031041495040', //Dev
];
const requirements = {
    'clan-board': ['Clan Name:', 'Clan Level:', 'Clan Info:', 'discord.gg/'],
    'customizations': ['Type:', 'Name:'],
    'community-maps': ['Map Name:', 'Map Link:', 'Description:'],
    'community-mods': ['Mod Name:', 'Modifies:'],
    'skin-vote-submissions': ['Skin name:'],
    'bug-reports': ['Platform:', 'Operating System:', 'Report:', 'Reported by:', 'IGN:'],
    'community-css': ['CSS:', 'Description:']
}

module.exports.run = async(client, message) => {
    var canBypass = false;
    if (!canBypass) roles.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
    if (!canBypass) {
        let denyReasons = '';
        let eb = new MessageEmbed();

        if (message.content.toUpperCase().startsWith('SUGGEST')) {
            if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';

            if (denyReasons == '') {
                eb.setTitle('Suggestions submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content.substring(message.content.indexOf(' ') + 1))
                    .setTimestamp();
                if (message.attachments.size != 0) eb.setImage(message.attachments.array()[0].url);
            }
        } else if (message.content.toUpperCase().startsWith('CLIP:')){
            const videos = [
                'https://www.youtube.com/watch?v=',
                'https://youtu.be/',
                'https://streamable.com/',
                'https://medal.tv/',
                'https://clips.twitch.tv/',
                'https://www.twitch.tv/',
            ];
            if (videos.every(domain => !message.content.includes(domain))) denyReasons += `► submissions must include a **YouTube** video, a **Streamable** video, a **Medal** video, or a **Twitch** clip`;
            if (message.attachments.size) denyReasons += '- ***Too many attachments*** \n';
            if (denyReasons == '') {
                eb.setTitle('Clips of the week submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content.substring('clip:'.length).trim().split(" ").join(" "))
                    .setTimestamp();
            }

        } else if (message.content.toUpperCase().includes('CSS')) {
            if (message.attachments.size == 0) denyReasons += '- ***Missing attachment*** \n';
            if (message.attachments.size > 2) denyReasons += '- ***Too many attachments*** \n';
            requirements["community-css"].forEach(requirement => {
                if (!message.content.toUpperCase().split(" ").join("").includes(requirement.toUpperCase().split(" ").join(""))) denyReasons += `- Missing field: ***${requirement}*** \n`;
            })
            if (denyReasons == '') {
                eb.setTitle('Community CSS submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp();
                eb.attachFiles(message.attachments.array())

            }
        } else if (message.content.toUpperCase().includes('CLAN NAME')) {
            requirements["clan-board"].forEach(requirement => {
                if (!message.content.toUpperCase().split(" ").join("").includes(requirement.toUpperCase().split(" ").join(""))) denyReasons += `- Missing field: ***${requirement}*** \n`;
            });

            if (!message.content.startsWith('```')) message.content = '```' + message.content;
            if (!message.content.endsWith('```')) message.content += '\n```';

            if (denyReasons == '') {
                eb.setTitle('Clan boards submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp();
            }
        } else if (message.content.toUpperCase().includes('TYPE')) {
            if (message.attachments.size == 0) denyReasons += '- ***Missing attachment*** \n';
            else if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';
            requirements["customizations"].forEach(requirement => {
                if (!message.content.toUpperCase().split(" ").join("").includes(requirement.toUpperCase().split(" ").join(""))) denyReasons += `- Missing field: ***${requirement}*** \n`;
            });

            if (denyReasons == '') {

                eb.setTitle('Customizations submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setImage(message.attachments.array()[0].url)
                    .setTimestamp();
            }
        } else if (message.content.toUpperCase().includes('MAP NAME')) {
            if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';
            requirements["community-maps"].forEach(requirement => {
                if (!message.content.toUpperCase().split(" ").join("").includes(requirement.toUpperCase().split(" ").join(""))) denyReasons += `- Missing field: ***${requirement}*** \n`;
            });

            if (denyReasons == '') {
                eb.setTitle('Community maps submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp();
                if (message.attachments.size != 0) eb.setImage(message.attachments.array()[0].url);
            }
        } else if (message.content.toUpperCase().includes('MOD NAME')) {
            if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';
            requirements["community-mods"].forEach(requirement => {
                if (!message.content.toUpperCase().split(" ").join("").includes(requirement.toUpperCase().split(" ").join(""))) denyReasons += `- Missing field: ***${requirement}*** \n`;
            });

            if (denyReasons == '') {
                eb.setTitle('Community mods submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp();
                if (message.attachments.size != 0) eb.setImage(message.attachments.array()[0].url);
            }
        } else if (message.content.toUpperCase().includes('SKIN NAME')) {
            if (message.attachments.size == 0) denyReasons += '- ***Missing attachment*** \n';
            if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';

            if (denyReasons == '') {
                eb.setTitle('Skin vote submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp();
                if (message.attachments.size != 0) eb.setImage(message.attachments.array()[0].url);
                
            }
        } else if (message.content.toUpperCase().includes('REPORT')) {
            // if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';
            // requirements["bug-reports"].forEach(requirement => {
            //     if (!message.content.toUpperCase().split(" ").join("").includes(requirement.toUpperCase().split(" ").join(""))) denyReasons += `- Missing field: ***${requirement}*** \n`;
            // });

            // if (denyReasons == '') {
            //     eb.setTitle('Bug reports submission request')
            //         .setColor('YELLOW')
            //         .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
            //         .setDescription(message.content)
            //         .setTimestamp();
            //     if (message.attachments.size != 0) eb.setImage(message.attachments.array()[0].url);
            // }
        } else {
            message.channel.send(`<@${message.author.id}>,`, new MessageEmbed()
                .setTitle('INVALID INPUT')
                .setColor('RED')
                .setDescription('Invalid input. Please read the pinned message on how to use this channel.')
            ).then(m => { m.delete({ timeout: 30000 }) });
            logger.messageDeleted(message, 'Modmail', 'NAVY');
            return;
        }

        if (denyReasons == '') {
            const fetchData = await submissions_db.get(message.guild.id);
            approvalRequest(client, message, eb.setTitle(`${eb.title} #${fetchData.subID}`));
            await submissions_db.set(message.guild.id, { subID: fetchData.subID + 1 });
            logger.messageDeleted(message, 'Modmail', 'NAVY');
        } else {
            autoDeny(message, denyReasons);
            client.setTimeout(() => {
                logger.messageDeleted(message, 'Modmail', 'NAVY');
            }, 10000);
        }
    }
}
module.exports.react = async(client, reaction, user) => {
    await reaction.fetch();
    await reaction.message.fetch();
    let embed = reaction.message.embeds[0];
    if (!embed || embed.hexColor != id.colours["YELLOW"]) return;
    reaction.message.edit(embed.setColor('BLACK'));

    const member = await client.users.fetch(embed.author.name.match(/\((\d{17,19})\)/)[1], true, true);

    switch (reaction.emoji.id) {
        case id.emojis.yes:
            await approveRequest(client, reaction, user, member, embed);
            break;
        case id.emojis.no: 
        {
                const reasonMessage = await reaction.message.channel.send(`<@${user.id}> Please provide a reason:`);
                const reasonMessages = await reaction.message.channel.awaitMessages(m => m.author.id == user.id, { max: 1, time: 60000, errors: ['time'] }).catch(() => {
                reaction.message.channel.send(`<@${user.id}> Timeout. Please go react again.`).then(m => m.delete({ timeout: 7000 }));
                reasonMessage.delete();
                return;
            });
            embed = denyRequest(member, user, reasonMessages.first().content, embed);
            reasonMessage.delete();
            reasonMessages.first().delete();
            break;
        }
        case id.emojis.formatting:
            embed = denyRequest(member, user, 'Incorrect formatting.', embed);
            break;
        case id.emojis.missing:
            embed = denyRequest(member, user, 'Missing information.', embed);
            break;
        case id.emojis.script:
        {
            const editedMessage = await reaction.message.channel.send(`<@${user.id}> Please provide an edited version:`);
            const editedMessages = await reaction.message.channel.awaitMessages(m => m.author.id == user.id, { max: 1, time: 60000, errors: ['time'] }).catch(() => {
                reaction.message.channel.send(`<@${user.id}> Timeout. Please go react again.`).then(m => m.delete({ timeout: 7000 }));
                editedMessage.delete();
                return;
            });
            embed.addField('Original', embed.description)
                .setDescription(editedMessages.first().content);
            embed = await approveRequest(client, reaction, user, member, embed);
            console.log(embed.title)
            editedMessage.delete();
            editedMessages.first().delete();
            break;
        }
        default:
            reaction.messsage.edit(embed.setColor('YELLOW'));
            return;
    }

    reaction.message.edit(embed);

    //DB stuff
    const fetchUser = await moderator_db.get(user.id);
    const discordUser = await client.users.fetch(user.id);
    const submissions = fetchUser ? fetchUser.submissions + 1 : 1;
    const update = await moderator_db.set(user.id, { username: discordUser.username, submissions: submissions });
    if (!update) {
        reaction.mesage.channel.send(new MessageEmbed()
            .setTitle('Database Error')
            .setColor('RED')
            .setDescription('A database error has occured. Please contact JJ if he has not been contacted already. Your submission approval was not documented in your stats.')
            .setTimestamp());
    }
}

function autoDeny(message, denyReasons) {
    message.channel.send(`<@${message.author.id}>,`, new MessageEmbed()
        .setTitle('Missing info')
        .setColor('RED')
        .setDescription(denyReasons)
    ).then(m => { m.delete({ timeout: 60000 }) });
}

async function approvalRequest(client, message, embed) {
    if (embed.image) embed = await proxyEmbedImage(client, embed);
    if (embed.description.includes('https://')) embed = AttachEmbedImages(embed);

    message.channel.send(`<@${message.author.id}>,`, new MessageEmbed()
        .setTitle('Submission sent for review')
        .setColor('GREEN')
        .setDescription('To receive updates about your submission, please ensure that you do not have me blocked. Check your DMs with me for you submission ID.')
        .setTimestamp()
    ).then(m => { m.delete({ timeout: 30000 }) });
    message.author.createDM().then(dm => dm.send(new MessageEmbed()
        .setTitle(`Submission ID: #${embed.title.split('#')[1]}`)
        .setColor('YELLOW')
        .setTimestamp()).catch(logger.error));
    client.channels.resolve(id.channels["submissions-review"]).send(embed).then(m => {
        m.react(client.emojis.cache.get(id.emojis.yes));
        m.react(client.emojis.cache.get(id.emojis.no));
        m.react(client.emojis.cache.get(id.emojis.formatting));
        m.react(client.emojis.cache.get(id.emojis.missing));
        m.react(client.emojis.cache.get(id.emojis.script));
    });
}

async function approveRequest(client, reaction, user, member, embed) {
    let sentMsg;
    const post = new MessageEmbed()
        .setAuthor(`${member.tag} (${member.id})`, member.displayAvatarURL())
        .setDescription(embed.description)
        .setFooter('Go to #submissions to submit a request')
        .setTimestamp();
    if (embed.image) post.setImage(embed.image.url);
    if (reaction.message.attachments.size > 0) post.attachFiles(reaction.message.attachments.array());
    let title = embed.title.split(' ');
    title.pop();
    switch (title.join(' ')) {
        case 'Suggestions submission request':
            sentMsg = await client.channels.resolve(id.channels["suggestions"]).send(post.setColor('YELLOW'));
            sentMsg.react("👍");
            sentMsg.react("👎");
            break;
        case 'Clips of the week submission request':
            sentMsg = await client.channels.resolve(id.channels["clips-of-the-week"]).send(`<@${member.id}> \n${embed.description}`);
            break;
        case 'Clan boards submission request':
            sentMsg = await client.channels.resolve(id.channels["clan-boards"]).send(`${post.description.substring(post.description.indexOf('discord.gg/')).split(' ')[0].split('`')[0]}`, post);
            break;
        case 'Customizations submission request':
            sentMsg = await client.channels.resolve(id.channels["customizations"]).send(post.setImage(embed.image.url));
            break;
        case 'Community maps submission request':
            sentMsg = await client.channels.resolve(id.channels["community-maps"]).send(post);
            break;
        case 'Community mods submission request':
            sentMsg = await client.channels.resolve(id.channels["community-mods"]).send(post);
            break;
        case 'Skin vote submission request':
            sentMsg = await client.channels.resolve(id.channels["skin-vote-submissions"]).send(post);
            break;
            // case 'Bug reports submission request':
            //     break;
    }
    if (sentMsg) {
        member.createDM(true).then(dm => {
            dm.send(new MessageEmbed()
                .setColor('GREEN')
                .setTitle('Submission Posted')
                .setDescription(`Thank you for your submission. View your submission [here](${sentMsg.url}).`)
                .setFooter('Submission approved by: ' + user.username, user.displayAvatarURL())
                .setTimestamp());
        });
        return embed.setColor('GREEN')
            .setTitle(embed.title.replace('request', 'approved'))
            .addField('Posted:', `[Here](${sentMsg.url})`)
            .setFooter('Approved by ' + user.username, user.displayAvatarURL())
            .setTimestamp();
    } else {
        reaction.message.channel.send(new MessageEmbed()
            .setTitle('Error posting message')
            .setColor('RED')
            .setDescription('If this issue continues to persist, please contact JJ or Jytesh')
            .setTimestamp());
    }
}

function denyRequest(member, user, reason, embed) {
    member.createDM().then(dm => {
        dm.send(new MessageEmbed()
            .setTitle('Submission request denied')
            .setColor('ORANGE')
            .setDescription('Your submission request has been denied. For help, please check out the guide [here](https://discord.com/channels/448194623580667916/779620494328070144/782082253345390592). If you think this is a mistake, please contact ' + user.tag)
            .addField('Reason:', reason)
            .setFooter('Submission denied by ' + user.username, user.displayAvatarURL())
            .setTimestamp());
    });
    return embed.setColor('RED')
        .setTitle(embed.title.replace('request', 'denied'))
        .setFooter('Denied by ' + user.username, user.displayAvatarURL())
        .addField('Reason', reason)
        .setTimestamp();
}

async function proxyEmbedImage(client, embed) {
    const proxy = await client.channels.resolve(id.channels["submissions-extra"]).send({ files: [new MessageAttachment(embed.image.url)] });
    return embed.setImage(proxy.attachments.array()[0].url);
}

function AttachEmbedImages(embed) {
    const links = new Array();
    const description = new Array();
    embed.description.split(' ').forEach(t => {
        if (t.includes('https://')) {
            t.split(/\r\n|\r|\n/g).forEach((temp, index, array) => {
                if (temp.startsWith('https://') && !temp.includes('discord.gg/') && !temp.includes('krunker.io/')) {
                    let endIndex = null;
                    if (temp.includes('.png')) endIndex = temp.indexOf('.png') + 4;
                    else if (temp.includes('.gif')) endIndex = temp.indexOf('.gif') + 4;
                    else if (temp.includes('.mp4')) endIndex = temp.indexOf('.mp4') + 4;
                    else if (temp.includes('.mov')) endIndex = temp.indexOf('.mov') + 4;
                    else if (temp.includes('.jpeg')) endIndex = temp.indexOf('.jpeg') + 5;
                    else if (temp.includes('.jpg')) endIndex = temp.indexOf('.jpg') + 4;
                    if (endIndex != null) links.push(new MessageAttachment(temp.substring(0, endIndex)));
                } else index == array.length - 1 ? description.push(`${temp}`) : description.push(`${temp}\n`);
            });
        } else description.push(t)
    });
    if (description.length > 0) embed.description = description.join(' ');
    if (links.length > 0) embed.attachFiles(links)
    return embed;
}

module.exports.config = {
    name: 'modmail',
}