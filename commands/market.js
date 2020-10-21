const config = require("../config.json");
const db = require("../mongo.js");
const { MessageEmbed } = require("discord.js")

// Access IDs
const roles = [
    '692870902005629041', // Trial Mod
    '448207247215165451', // Mod
    '448195089471111179', // CM
];
const users = [
    '425441636449910807', // JB#0001
    '363756486100385801', // ReDeagle#7877
    '375009526296084491', // MyLittleSpartan#6984
    '235418753335033857', // JJ_G4M3R#2155
    '485676072176713729', // ._.#3220
    '235935874888630272', // SUUUN#0876,
    '561672873811509248', // hitthemoney#5719
];
const advisors = [
    '425441636449910807', // JB#0001
    '504794061820133383', // ItzUchiha#8516
    '363756486100385801', // ReDeagle#7877
    '485676072176713729', // ._.#3220
    '622950330283458580', // Arjun#6969
    '711641594314358907', // King_#8888
    '561672873811509248', // hitthemoney#5719
];

module.exports.run = (client, message) => {
    if (message.content.startsWith(config.prefix)) {
        let cmd = message.content.slice(config.prefix.length).split(" ")[0].toLowerCase();
        switch (cmd) {
            case "trade":
                trade(message);
                break;
            case "help":
                helpCmd(message);
                break;
            case "pins":
                pins(message);
                break;
            case "advisors":
                advisorsCmd(message);
                break;
            case "advise":
                advise(client, message);
                break;
            case "stonks":
                stonks(client, message);
                break;
            case "bid":
                bid(client, message);
                break;
        }
    }
}

// Mini Mod Functions
function trade(message) {
    miniModBase(message, 'Trade/Trading? Make sure you are in the right channel. \n - <#604386199976673291> is for trade advice \n - <#710454866002313248> is for trade listings.');

    message.delete();
}

function helpCmd(message) {
    const args = message.content.split(' ');
    if (args[1] == '-user') {
        if (users.includes(message.author.id)) {
            const eb = new MessageEmbed()
                .setTitle('Krunker Bunker Bot Help Guide - Users')
                .setColor('ORANGE')
                .addField(`\`${config.prefix}trade [optional id]\``, 'Remind kids where to trade items and where to get trade advice.')
                .addField(`\`${config.prefix}help [optional id]\``, 'Remind kids of what commands they can use.')
                .addField(`\`${config.prefix}help -users\``, 'This thingy.')
                .addField(`\`${config.prefix}pins [optional id]\``, 'Remind kids of the pins.')
                .addField(`\`${config.prefix}advisors\``, 'Remind kids of who the current advisors are.')
                .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
                .setTimestamp();
            message.author.createDM().then(m => m.send(eb));
        }
    } else if (args[1] == '-advisor') {
        if (advisors.includes(message.author.id)) {
            const eb = new MessageEmbed()
                .setTitle('Krunker Bunker Bot Help Guide - Advisors')
                .setColor('RED')
                .addField(`\`${config.prefix}advisors\``, 'Remind kids of who the current advisors are.')
                .addField(`\`${config.prefix}advise (yes/no) (message id)\``, 'React with a special emotes to stonks votes.')
                .addField()
                .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
                .setTimestamp();
            message.author.createDM().then(m => m.send(eb));
        }
    } else {
        miniModBase(message, 'Need help with market? Here are the commands. \n - \`$stonks\` is for advice on whether a trade is good or bad. \n - \`$bid\` is for creating a new bid (See \`$bid -help\` for more information). \n -> For both commands, please remember to include relevant images.');
    }

    message.delete();
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
    ];

    const args = message.content.split(' ');
    miniModBase(message, args.length == 3 && args[2] >= 0 && args[2] < rules.length ? `\n- ${rules[args[2]]}` : `\n- ${rules.join('\n- ')}`);

    message.delete();
}

//Advisor Functions
function advisorsCmd(message) {
    var canAccess = users.includes(message.author.id) || advisors.includes(message.author.id);
    if (!canAccess) roles.forEach(role => { if (message.member.roles.cache.has(role)) canAccess = true; return });
    if (canAccess) {
        var advisorsInString = '';
        advisors.forEach((id) => { advisorsInString += `- <@${id}> \n` });
        const eb = new MessageEmbed()
            .setTitle('Advisors')
            .setDescription('This is a list of people who are known to give proper advice.')
            .setColor('GREEN')
            .addField('Current Advisors:', advisorsInString)
            .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
            .setTimestamp();
        message.channel.send(eb);
    }
    message.delete();
}

function advise(client, message) {
    const args = message.content.split(' '); // Checks if author is an advisor
    if (advisors.includes(message.author.id)) {
        const emote = args[1] == 'yes' ? client.emojis.cache.get('540751229022765067') : "💩"; // Gets emote depending on advisor's advice
        message.channel.messages.fetch(args[2]).then(m => m.react(emote)).catch(console.error); // Gets message by id and then reacts with emote
    }
    message.delete();
}

// Public Functions
function stonks(client, message) {
    if (message.attachments.size == 0) { // Checks if message lacks an attachment
        message.reply("please include **cropped** image displaying the trade in question.").then(msg => {
            msg.delete({ timeout: 6000 }); // Autodel after 6000ms
        }).catch(console.error);
        message.delete();
        return;
    }
    message.react(client.emojis.cache.get('744384600780046438')); // Stonks emote
    message.react(client.emojis.cache.get('744384600780046418')); // Meh emote
    message.react(client.emojis.cache.get('744384601165791302')); // Bonks emote
}

async function bid(client, message) {
    const args = message.content.split(" ");
    var doNotDelete = false;

    if (args[1] == '-c') { // Creating bid
        const hasActiveBid = await db.market.hasActiveBid(message.author.id, message.author.tag);
        if (hasActiveBid == -1) {
            dbError(message);
        } else if (hasActiveBid == false) {
            if (message.attachments.size > 0) {
                if (args.length >= 4) {
                    const createdBid = await db.market.createNewBid(message.author.id, {
                        start: Math.abs(parseInt(args[2])),
                        min: Math.abs(parseInt(args[3])),
                        url: message.attachments.first().url
                    });
                    if (createdBid == -1) {
                        dbError(message);
                    } else {
                        const eb = new MessageEmbed()
                            .setTitle(`Bid #${createdBid.bid} Created`)
                            .setColor('GREEN')
                            .addField('Host:', `<@${createdBid.uid}>`, true)
                            .addField('Starting bid:', `${createdBid.start} kr`, true)
                            .addField('Minimum increments:', `${createdBid.min} kr`, true)
                            .setThumbnail(createdBid.url)
                            .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
                            .setTimestamp();
                        message.channel.send(eb);
                        doNotDelete = true;
                    }
                } else {
                    message.reply("your message was deleted. Please ensure that your message includes the proper details required to create a bid.").then(msg => {
                        msg.delete({ timeout: 6000 });
                    }).catch(console.error);
                }
            } else {
                message.reply("please include an image displaying the item you wish to auction off.").then(msg => {
                    msg.delete({ timeout: 6000 });
                }).catch(console.error);
            }
        } else {
            message.reply("you already have an active bid open. Please close the active bid before creating a new one.").then(msg => {
                msg.delete({ timeout: 6000 });
            }).catch(console.error);
        }
    } else if (args[1] == '-f') { // Finalise bid
        const hasActiveBid = await db.market.hasActiveBid(message.author.id, message.author.tag);
        if (hasActiveBid == -1) {
            dbError(message);
        } else if (hasActiveBid == true) {
            const finalisedBid = await db.market.finaliseBid(message.author.id);
            if (finalisedBid == -1) {
                dbError(message);
            } else {
                const eb = new MessageEmbed()
                    .setTitle(`Bid #${finalisedBid.bid} Finalised`)
                    .setColor('RED')
                    .addField('Host:', `<@${finalisedBid.uid}>`, true)
                    .addField('Buyer:', `<@${finalisedBid.bidder}>`, true)
                    .addField('Final Price:', `${finalisedBid.curVal} kr`, true)
                    .setThumbnail(finalisedBid.url)
                    .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
                    .setTimestamp();
                message.channel.send(eb);
            }
        } else {
            message.reply("you do not have an active bid open. Please create an active bid before finalising one.").then(msg => {
                msg.delete({ timeout: 6000 });
            }).catch(console.error);
        }
    } else if (args[1] == '-help') { //Help with bid
        const eb = new MessageEmbed()
            .setTitle('Need help with bidding in Krunker Bunker?')
            .setColor('BLURPLE')
            .setAuthor(client.user.tag, client.user.avatarURL())
            .setDescription('In-depth tutorial on how to use the bidding function in Krunker Bunker. All modifiers and input fields are to be separated by a space (\` \`).')
            .addField('Usage:', `\`${config.prefix}bid -c\``, true)
            .addField('Description:', `In order to create a bid, use the \`-c\` modifer after the bid command. Next, input the desired starting value for the bid. Finally, input the desired minimum increment for the bid (this is how much more KR others must bid on top of the previous bid). The bot will then reply with a confirmation message containing the bid ID # other members can bid upon. \n\n ex) \`${config.prefix}bid -c 1000 100\` -> Creates a bid which starts at 1000 kr and with a minimum increment of 100 kr. \n\n *>Note: Must include an attached image displaying the item to be auctioned.*`, true)
            .addField('\u200B', '\u200B')
            .addField('Usage:', `\`${config.prefix}bid -f\``, true)
            .addField('Description', `In order to finalise a bid, use the \`-c\` modifier after the bid command. The bot will then send a confirmation message containing all relevant information for the buyer and host. (Coming soon: Will also send a DM to the buyer to notify them of their purchase.) \n\n ex) \`${config.prefix}bid -f\` -> Finalises whatever bid the message author have open.`, true)
            .addField('\u200B', '\u200B')
            .addField('Usage:', `\`${config.prefix}bid [bid ID #]\``, true)
            .addField('Description:', `In order to bid on items, enter the bid's ID # after the bid command. Next, input the desired value for the bid. The bot will then reply with a confirmation message containing updated inforamtion about the bid. \n\n ex) \`${config.prefix}bid 55 1100\` -> Bids 1000 kr on bid #55.`, true)
            .addField('\u200B', '\u200B')
            .addField('Usage:', `\`${config.prefix}bid -help\``, true)
            .addField('Description:', `In order to see a detailed tutorial on how to use the bid command, use the \`-help\` modifier after the bid command. \n\n ex) \`${config.prefix}bid -help\` -> Sends a DM with this embeded message attached.`, true)
            .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
            .setTimestamp();
        message.author.createDM().then(m => m.send(eb));
    } else { // Bid on item
        const args = message.content.split('-').join('').split(' ');
        if (args.length == 3) {
            const exists = await db.market.bidExists(parseInt(args[1]));
            if (exists == -1) {
                dbError(message);
            } else if (exists == true) {
                const isOpen = await db.market.bidIsOpen(parseInt(args[1]));
                if (isOpen == -1) {
                    dbError(message);
                } else if (isOpen == true) {
                    const isSelf = await db.market.isSelf(message.author.id, parseInt(args[1]));
                    if (isSelf == -1) {
                        dbError(message);
                    } else if (isSelf == false) {
                        const bidIsHigher = await db.market.bidIsHigher(parseInt(args[1]), parseInt(args[2]));
                        if (bidIsHigher == -1) {
                            dbError(message);
                        } else if (bidIsHigher == true) {
                            const updatedBid = await db.market.updateBid(parseInt(args[1]), message.author.id, parseInt(args[2]));
                            if (updatedBid == -1) {
                                dbError(message);
                            } else {
                                const eb = new MessageEmbed()
                                    .setTitle(`Bid #${updatedBid.bid} Updated`)
                                    .setColor('YELLOW')
                                    .addField('Starting Price:', `${updatedBid.start} kr`, true)
                                    .addField('Minimum Increment:', `${updatedBid.min} kr`, true)
                                    .addField('Current Price:', `${updatedBid.curVal} kr`, true)
                                    .addField('Host:', `<@${updatedBid.uid}>`, true)
                                    .addField('Highest Bidder:', `<@${updatedBid.bidder}>`, true)
                                    .setThumbnail(updatedBid.url)
                                    .setFooter('Krunker Bunker Bot • Designed by JJ_G4M3R and Jytesh')
                                    .setTimestamp();

                                message.channel.send(eb).then(async(m) => {
                                    if (updatedBid.lastMsgID != -1) message.channel.messages.fetch(updatedBid.lastMsgID).then(m => m.delete());
                                    const updateLastMsgID = await db.market.updateMsgID(parseInt(args[1]), m.id);
                                    if (updateLastMsgID == -1) dbError(message);
                                });
                            }
                        } else {
                            message.reply('your bid is not high enough to outbid the previous highest bid and/or does not meet the minimum required increment.').then(msg => {
                                msg.delete({ timeout: 6000 });
                            }).catch(console.error);
                        }
                    } else {
                        message.reply('you cannot bid on your own items.').then(msg => {
                            msg.delete({ timeout: 6000 });
                        }).catch(console.error);
                    }
                } else {
                    message.reply(`bid #${args[1]} is already closed. Please pick another bid to bid on.`).then(msg => {
                        msg.delete({ timeout: 6000 });
                    }).catch(console.error);
                }
            } else {
                message.reply(`bid #${args[1]} does not exist. Please make sure you have entered the correct bid ID #.`).then(msg => {
                    msg.delete({ timeout: 6000 });
                }).catch(console.error);
            }
        } else {
            message.reply('your message was deleted. Please ensure that your message includes the proper details required to bid.').then(msg => {
                msg.delete({ timeout: 6000 });
            }).catch(console.error);
        }
    }
    if (!doNotDelete) message.delete();
}

// Util Functions 
function dbError(message) {
    message.channel.send("Database error. Please try again later.").then(msg => {
        msg.delete({ timeout: 6000 });
    }).catch(console.error);
}

function miniModBase(message, str) {
    var canAccess = users.includes(message.author.id); // Checks if author is in the access list
    if (!canAccess) roles.forEach(role => { if (message.member.roles.cache.has(role)) canAccess = true; return }); // If author is not in access list, checks if roles they have are.
    if (canAccess) {
        const ping = message.content.split(' ').length > 1 ? `<@${message.content.split(' ')[1]}> ` : ''; // Allows for an optional ping with the message.
        message.channel.send(`${ping}${str}`);
    }
}

module.exports.config = {
    name: 'market',
    aliases: ['market'],
}
module.exports.help = {
    usage: '',
    User: 0,
    description: ''
}
