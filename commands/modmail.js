const id = require("../id.json"),
    { MessageEmbed } = require("discord.js"),
    logger = require("../logger");

const roles = [
    '692870902005629041', //Trial Mod
    '448207247215165451', //Mod
    '448195089471111179', //CM
    '638129127555072028', //Yendis
    '448198031041495040', //Dev
];

const requestKeys = {
    'suggestion': ['suggest', 'suggestion'],
    'clan-board': ['clan', 'clans', 'clan-board'],
    'customizations': ['customization', 'customizations', 'customisation', 'customisations'],
    'community-maps': ['map', 'maps', 'community map', 'community maps'],
    'community-mods': ['mod', 'mods', 'community mod', 'community mods'],
    'skin-vote-submissions': ['skin', 'skins', 'skinvote', 'skin vote'],
    'bug-reports': [], //['bug', 'bug report'],
    'exploit-reports': [], //['exploit', 'exploit report'],
}

const requirements = {
    'clan-board': ['Clan Name:', 'Clan Level:', 'Clan Info:', 'discord.gg/'],
    'customizations': ['Type:', 'Name:'],
    'community-maps': ['Map Name:', 'Description:'],
    'community-mods': ['Mod Name:', 'Modifies:'],
    'skin-vote-submissions': ['Name:'],
    'bug-reports': ['Platform:', 'Operating System:', 'Report:', 'Reported by:', 'IGN:'],
}

module.exports.run = (client, message) => {
    var canBypass = false;
    //if (!canBypass) roles.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
    if (!canBypass) {
        let denyReasons = '';

        if (message.content.toUpperCase().startsWith('SUGGEST')) {
            approvalRequest(client, new MessageEmbed()
                .setTitle('Suggestions submission request')
                .setColor('YELLOW')
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                .setDescription(message.content.substring(message.content.indexOf(' ') + 1))
                .setTimestamp());
        } else if (message.content.toUpperCase().includes('CLAN NAME')) {
            requirements["clan-board"].forEach(requirement => { if (message.content.localeCompare(requirement, undefined, { sensitivity: 'base' }) == 0) denyReasons += `- Missing field: ***${requirement}*** \n`; });

            if (!message.content.startsWith('```')) message.content = '```' + message.content;
            if (!message.content.endsWith('```')) message.content += '\n```';

            if (denyReasons == '') {
                approvalRequest(client, new MessageEmbed()
                    .setTitle('Clan boards submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp());
            } else {
                autoDeny(message, denyReasons);
            }
        } else if (message.content.toUpperCase().includes('TYPE')) {
            if (message.attachments.size == 0) denyReasons += '- ***Missing attachment*** \n';
            else if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';
            requirements["customizations"].forEach(requirement => { if (message.content.localeCompare(requirement, undefined, { sensitivity: 'base' }) == 0) denyReasons += `- Missing field: ***${requirement}*** \n`; });

            if (denyReasons == '') {
                approvalRequest(client, new MessageEmbed()
                    .setTitle('Customisations submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setImage(message.attachments.array()[0].url)
                    .setTimestamp());
            } else {
                autoDeny(message, denyReasons);
            }
        } else if (message.content.toUpperCase().includes('MAP NAME')) {
            if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';
            requirements["community-maps"].forEach(requirement => { if (message.content.localeCompare(requirement, undefined, { sensitivity: 'base' }) == 0) denyReasons += `- Missing field: ***${requirement}*** \n`; });

            if (denyReasons == '') {
                approvalRequest(client, new MessageEmbed()
                    .setTitle('Community maps submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setImage(message.attachments.array()[0].url)
                    .setTimestamp());
            } else {
                autoDeny(message, denyReasons);
            }
        } else if (message.content.toUpperCase().includes('MOD NAME')) {
            if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';
            requirements["community-mods"].forEach(requirement => { if (message.content.localeCompare(requirement, undefined, { sensitivity: 'base' }) == 0) denyReasons += `- Missing field: ***${requirement}*** \n`; });

            if (denyReasons == '') {
                const eb = new MessageEmbed()
                    .setTitle('Community mods submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp();
                if (message.attachments.size != 0) eb.setImage(message.attachments.array()[0].url);

                approvalRequest(client, eb);
            } else {
                autoDeny(message, denyReasons);
            }
        } else if (message.content.toUpperCase().includes('SKIN NAME')) {
            if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';
            requirements["skin-vote-submissions"].forEach(requirement => { if (message.content.localeCompare(requirement, undefined, { sensitivity: 'base' }) == 0) denyReasons += `- Missing field: ***${requirement}*** \n`; });

            if (denyReasons == '') {
                const eb = new MessageEmbed()
                    .setTitle('Skin vote submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp();
                if (message.attachments.size != 0) eb.setImage(message.attachments.array()[0].url);

                client.channels.resolve(id.channels["skin-vote-submissions"]).send(eb);
            } else {
                autoDeny(message, denyReasons);
            }

        } else if (message.content.toUpperCase().includes('REPORT')) {
            if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';
            requirements["bug-reports"].forEach(requirement => { if (message.content.localeCompare(requirement, undefined, { sensitivity: 'base' }) == 0) denyReasons += `- Missing field: ***${requirement}*** \n`; });

            if (denyReasons == '') {
                const eb = new MessageEmbed()
                    .setTitle('Bug reports submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp();
                if (message.attachments.size != 0) eb.setImage(message.attachments.array()[0].url);

                approvalRequest(client, eb);
            } else {
                autoDeny(message, denyReasons);
            }
        } else if (message.content.toUpperCase().includes('EXPLOIT')) {
            if (message.attachments.size > 1) denyReasons += '- ***Too many attachments*** \n';

            if (denyReasons == '') {
                const eb = new MessageEmbed()
                    .setTitle('Exploit reports submission request')
                    .setColor('YELLOW')
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                    .setDescription(message.content)
                    .setTimestamp();
                if (message.attachments.size != 0) eb.setImage(message.attachments.array()[0].url);

                approvalRequest(client, eb);
            } else {
                autoDeny(message, denyReasons);
            }
        } else {
            message.channel.send(new MessageEmbed()
                .setTitle('INVALID INPUT')
                .setColor('RED')
                .setDescription('Invalid input. Please read the pinned message on how to use this channel.')
            ).then(m => { m.delete({ timeout: 30000 }) });
        }

        logger.messageDeleted(message, 'Modmail', 'NAVY');
    }
}

module.exports.react = async(client, reaction, user) => {
    await reaction.fetch();
    await reaction.message.fetch();
    const embed = reaction.message.embeds[0];
    if (!embed || embed.hexColor == id.colours["YELLOW"]) return

    const member = await client.users.fetch(embed.author.name.match(/\((\d{17,19})\)/)[1], true, true);

    switch (reaction.emoji.id) {
        case id.emojis.yes:
            let sentMsg;
            switch (embed.title) {
                case 'Suggestions submission request':
                    sentMsg = await client.channels.resolve(id.channels["suggestions"]).send(new MessageEmbed()
                        .setColor('YELLOW')
                        .setAuthor(`${member.tag} (${member.id})`, member.displayAvatarURL())
                        .setDescription(embed.description)
                        .setFooter('Go to #submissions to submit a request')
                        .setTimestamp());
                    sentMsg.react("👍");
                    sentMsg.react("👎");
                    break;
                case 'Clan boards submission request':
                    sentMsg = await client.channels.resolve(id.channels["clan-boards"]).send(new MessageEmbed()
                        .setAuthor(`${member.tag} (${member.id})`, member.displayAvatarURL())
                        .setDescription(embed.description)
                        .setFooter('Go to #submissions to submit a request')
                        .setTimestamp());
                    break;
                case 'Customizations submission request':

                    break;
                case 'Community maps submission request':

                    break;
                case 'Community mods submission request':

                    break;
                    // case 'Bug reports submission request':
                    //     break;
                    // case 'Exploit reports submission request':
                    //     break;
            }
            member.createDM(true).then(dm => {
                dm.send(new MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Submission Posted')
                    .setDescription(`Thank you for your submission. View your submission [here](${sentMsg.url}).`)
                    .setFooter('Submission approved by: ' + user.username, user.displayAvatarURL())
                    .setTimestamp());
            });
            embed.setColor('GREEN');
            break;
        case id.emojis.no:
            reaction.message.channel.send(`<@${user.id}> Please provide a reason:`)
            const messages = await reaction.message.channel.awaitMessages(m => m.author.id == user.id, { max: 1, time: 60000, errors: ['time'] }).catch(e => reaction.message.channel.send("Timeout. Please go decline it again."));
            denyRequest(member, user, messages.first().content);
            embed.setColor('RED');
            break;
        case id.emojis.formatting:
            denyRequest(member, user, 'Incorrect formatting.');
            embed.setColor('RED');
            break;
        case id.emojis.missing:
            denyRequest(member, user, 'Missing information.');
            embed.setColor('RED');
            break;
    }

    reaction.message.edit(embed)
}

function autoDeny(message, denyReasons) {
    message.reply(new MessageEmbed()
        .setTitle('Missing info')
        .setColor('RED')
        .setDescription(denyReasons)
    ).then(m => { m.delete({ timeout: 30000 }) });
}

function approvalRequest(client, embed) {
    client.channels.resolve(id.channels["submissions"]).send(new MessageEmbed()
        .setTitle('Submission sent for review')
        .setColor('GREEN')
        .setDescription('To receive updates about your submission, please ensure that you do not have me blocked.')
        .setTimestamp()).then(m => m.delete({ timeout: 10000 }));
    client.channels.resolve(id.channels["submissions-review"]).send(embed).then(m => {
        m.react(client.emojis.cache.get(id.emojis.yes));
        m.react(client.emojis.cache.get(id.emojis.no));
        m.react(client.emojis.cache.get(id.emojis.formatting));
        m.react(client.emojis.cache.get(id.emojis.missing));
    });
}

function denyRequest(member, user, reason) {
    member.createDM().then(dm => {
        dm.send(new MessageEmbed()
            .setTitle('Submission request denied')
            .setColor('ORANGE')
            .setDescription('Your submission request has been denied. For help, please check out the guide [here](https://discord.com/channels/448194623580667916/779620494328070144/779621435299725323). If you think this is a mistake, please contact ' + user.tag)
            .addField('Reason:', reason)
            .setFooter('Submission denied by ' + member.username, member.displayAvatarURL())
            .setTimestamp());
    });
}

module.exports.config = {
    name: 'modmail',
}