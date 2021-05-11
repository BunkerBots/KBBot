const config = require('../config.json'),
    id = require('../id.json'),
    { MessageEmbed } = require('discord.js'),
    logger = require('../logger'),
    // Access IDs
    roles = require('../app').staffRoles,
    users = [
        id.users.math,
        id.users.redeagle,
        id.users.jj,
        id.users.mooon,
        id.users.uchi,
    ],
    advisors = [
        id.users.ks,
    ];

module.exports.run = (client, message) => {
    if (message.content.toLowerCase().startsWith(`${config.prefix}trade`)) {
        miniModBase(message, `Trade/Trading? Make sure you are in the right channel. \n - <#${id.channels["market-chat"]}> is for trade advice \n - <#${id.channels["trading-board"]}> is for trade listings.`);
    } else if (message.content.toLowerCase().startsWith(`${config.prefix}help`)) {
        helpCmd(message);
    } else if (message.content.toLowerCase().startsWith(`${config.prefix}pins`)) {
        pins(message);
    } else if (message.content.toLowerCase().startsWith(`${config.prefix}advisors`)) {
        advisorsCmd(message);
    } else if (message.content.toLowerCase().startsWith(`${config.prefix}advise`)) {
        advise(client, message);
    } else if (message.content.toLowerCase().startsWith(`${config.prefix}stonks`)) {
        stonks(client, message);
    }
}

// Mini Mod Functions
function helpCmd(message) {
    const args = message.content.split(' ');
    if (args[1] == '-user' && users.includes(message.author.id)) message.author.createDM().then(m => m.send(new MessageEmbed()
        .setTitle('Krunker Bunker Bot Help Guide - Users')
        .setColor('ORANGE')
        .addField(`\`${config.prefix}trade [optional id]\``, 'Remind kids where to trade items and where to get trade advice.')
        .addField(`\`${config.prefix}help [optional id]\``, 'Remind kids of what commands they can use.')
        .addField(`\`${config.prefix}pins [optional id] [optional rule #]\``, 'Remind kids of the pins.')
        .addField(`\`${config.prefix}advisors\``, 'Remind kids of who the current advisors are.')
        .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
        .setTimestamp()));
    else if (args[1] == '-advisor' && advisors.includes(message.author.id)) message.author.createDM().then(m => m.send(new MessageEmbed()
        .setTitle('Krunker Bunker Bot Help Guide - Advisors')
        .setColor('RED')
        .addField(`\`${config.prefix}advisors\``, 'Remind kids of who the current advisors are.')
        .addField(`\`${config.prefix}advise (yes/no) (message id)\``, 'React with a special emotes to stonks votes.')
        .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
        .setTimestamp()));
    else message.channel.send("Need help with the stonks command? Just just send a message starting with `$stonks` with an image attached displaying the trade you want advice on.")

    logger.messageDeleted(message, 'Market command', 'PURPLE');
}

function pins(message) {
    const rules = [
        'No Free KR Spin flexing',
        'No loadout showcases',
        'No unboxings unless you intend to sell them',
        'No cashbacks',
        'No sob-stories',
        'No zero-to-hero challenge advertisements',
        'No excessive usage of caps',
        'No wagers, this is market chat, not wager chat',
        'No begging',
        'No excessive off-topic usage of the `$stonks` command',
        'No coin flipping, go gamble elsewhere',
    ];

    const args = message.content.split(' ');
    miniModBase(message, args.length == 3 && args[2] >= 0 && args[2] < rules.length ? `\n- ${rules[args[2]]}` : `\n- ${rules.join('\n- ')}`);
}

//Advisor Functions
function advisorsCmd(message) {
    var advisorsInString = '';
    advisors.forEach((id) => { advisorsInString += `- <@${id}> \n` });
    const eb = new MessageEmbed()
        .setTitle('Advisors')
        .setDescription('Here is a list of users who are known to be knowledgeable about the Krunker market. This list of users is provided for your convenience. Krunker Bunker as a server have no responsibility for the advice or actions of these advisors. However, if you wish to file a complaint against any of these users for their actions as an advisor, you may contact @JJ_G4M3R#2155.')
        .setColor('GREEN')
        .addField('Current Advisors:', advisorsInString)
        .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
        .setTimestamp();
    message.channel.send(eb);
}

function advise(client, message) {
    const args = message.content.split(' '); // Checks if author is an advisor
    if (advisors.includes(message.author.id)) message.channel.messages.fetch(args[2]).then(m => m.react(args[1] == 'yes' ? client.emojis.cache.get(id.emojis.verified) : "💩")).catch(console.error);
    logger.messageDeleted(message, 'Market command', 'PURPLE');
}

// Public Functions
function stonks(client, message) {
    if (message.attachments.size == 0) { // Checks if message lacks an attachment
        message.channel.send(`<@${message.author.id}>, please include **cropped** image displaying the trade in question.`).then(msg => { msg.delete({ timeout: 6000 }) }).catch(console.error);
        return logger.messageDeleted(message, 'Invalid use of stonks command', 'PURPLE');
    }
    message.react(client.emojis.cache.get(id.emojis.yes));
    message.react(client.emojis.cache.get(id.emojis.neutral));
    message.react(client.emojis.cache.get(id.emojis.no));
}

// Util Functions 
function miniModBase(message, str) {
    var canAccess = users.includes(message.author.id); // Checks if author is in the access list
    if (!canAccess) roles.forEach(role => { if (message.member.roles.cache.has(role)) canAccess = true; return }); // If author is not in access list, checks if roles they have are.
    if (canAccess) message.channel.send(`${message.content.split(' ').length > 1 ? `<@${message.content.split(' ')[1]}> ` : ''}${str}`);
    logger.messageDeleted(message, 'Market command', 'PURPLE');
}

module.exports.config = {
    name: 'market',
}