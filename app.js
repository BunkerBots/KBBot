/* eslint-disable linebreak-style */
/* eslint-disable no-control-regex  */
require('dotenv').config();
const fetch = require('node-fetch');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js')
global.domains = [];
// getDomains();
// Load Dependencies
const env = !process.argv[2] || process.argv[2] == 'test' ? 'DEV' : 'PROD',

    config = require('./config.json'),
    delay = require('delay'),
    fs = require('fs'),
    id = require('./id.json'),
    { inspect } = require('util'),
    logger = require('./logger'),

    Discord = require('discord.js'),
    client = new Discord.Client({
        fetchAllMembers: false,
        partials: ['GUILD_MEMBER', 'REACTION', 'USER', 'MESSAGE'],
        intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_PRESENCES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
    }),

    Mongo = require('./mongo.js'),
    db = {
        submissions: new Mongo(process.env.DB_URL, { db: 'serverConfigs', coll: 'submissions', init: true }),
        moderator: new Mongo(process.env.DB_URL, { db: 'userConfigs', coll: 'moderators', init: true }),
    },

    // Twit = require('twit'),
    // twit = new Twit({
    //     consumer_key: process.env.TWITTER_CONSUMER_KEY,
    //     consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    //     access_token: process.env.TWITTER_ACCESS_TOKEN,
    //     access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    //     timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    //     strictSSL: true, // optional - requires SSL certificates to be valid. 
    // }),

    staffRoles = [
        id.roles.dev,
        id.roles.yendis,
        id.roles.cm,
        id.roles.mod,
        id.roles.tmod
    ],
    mee6Roles = [
        id.roles.rookie,
        id.roles.novice,
        id.roles.active,
        id.roles.apprentice,
        id.roles.devoted,
        id.roles.legendary,
        id.roles.mythical,
        id.roles.nolife,
        id.roles.godly,
        id.roles.ascended
    ],
    linkRoles = staffRoles.concat(mee6Roles),
    mktRoles = staffRoles.concat([id.roles.advisor]),
    stickerRoles = staffRoles.concat(mee6Roles.slice(mee6Roles.indexOf(id.roles.novice)), [id.roles.nitroBooster]),

    inviteBanChannels = [
        id.channels['general'],
        id.channels['random-chat'],
        id.channels['bot-comamnds'],
        id.channels['international-chat'],
        id.channels['krunker-translators'],
        id.channels['vip-casino'],
        id.channels['fun-bots'],
        id.channels['game-discussion'],
        id.channels['looking-for-game'],
        id.channels['market-chat'],
        id.channels['trading-board'],
    ];

Discord.TextChannel.prototype.sendEmbed = function sendEmbed(embed) {
    return this.send({ embeds: [embed] });
}
Object.keys(db).forEach(async t => await db[t].connect().catch(console.error));

client.roles = {
    link: linkRoles,
    mee6: mee6Roles,
    mkt: mktRoles,
    staff: staffRoles,
    stickers: stickerRoles,
};

module.exports = {
    client: client,
    db: db,
}

{
    // Load in commands
    client.commands = new Discord.Collection();
    const folders = fs.readdirSync(require('path').join(__dirname, 'commands'));
    for (const folder of folders) {
        const dir = require('path').join(__dirname, 'commands', folder);
        if (fs.lstatSync(dir).isDirectory()) {
            const cmdFiles = fs.readdirSync(dir).filter(f => f.includes('.js'));
            for (const cmdFile of cmdFiles) {
                const pull = require(require('path').join(__dirname, 'commands', folder, cmdFile));
                client.commands.set(pull.config.name, pull);
            }
        }
    }

    // Load in buttons
    client.buttons = new Discord.Collection();
    client.menus = new Discord.Collection();
    const btnFiles = fs.readdirSync('./buttons').filter(f => f.includes('.js'));
    const menuFiles = fs.readdirSync('./menus').filter(f => f.includes('.js'));
    if (btnFiles.length < 1) console.info('[KB Bot] There aren\'t any buttons');
    else for (const btnFile of btnFiles) {
        const pull = require(`./buttons/${btnFile}`);
        client.buttons.set(btnFile.split('.')[0], pull);
    }
    if (menuFiles.length < 1) console.info('[KB Bot] There aren\'t any menus');
    else for (const menuFile of menuFiles) {
        const pull = require(`./menus/${menuFile}`);
        client.menus.set(menuFile.split('.')[0], pull);
    }
}

// Login
client.login(process.env.TOKEN);

// Event Handlers
client.on('ready', async () => {
    console.info('[Krunker Bunker Bot] ready to roll!');

    // Host Only Start-up
    if (env == 'PROD') {
        client.user.setActivity('#submissions', { type: "WATCHING" });

        const bunkerBotCommands = client.channels.resolve(id.channels["bunker-bot-commands"]);
        bunkerBotCommands.send(config.version);

        // Log to bunkerbotCommands
        client.on('log', (...args) => {
            bunkerBotCommands.send(args.map(x => {
                if (typeof x == 'string') return x;
                else return require('util').inspect(x);
            }).join('\n\n'));
        });

        // Deal with channels on start-up
        // client.channels.resolve(id.channels["looking-for-game"]).messages.fetch({ limit: 100 }, false, true).then(messages => {
        //     [...messages.values()].forEach(message => {
        //         logger.messageDeleted(message, 'Bot reboot autodel', 'AQUA');
        //     });
        // });
        client.channels.resolve(id.channels["report-hackers"]).messages.fetch({ limit: 100 }, false, true).then(messages => {
            [...messages.values()].forEach(message => {
                if (message.author.id == id.users.kbbot) delay(20000).then(() => message.delete());
                else if (message.author.id != id.users.kb) client.commands.get('reporthackers').run(client, message);
            });
        });

        // Unhandled Error Logging
        const log = await client.channels.fetch(id.channels["log"]);
        process.on('uncaughtException', (e) => {
            log.send({ content: '```js\n' + require('util').inspect(e) + '```', disableMentions: 'all' });
        });
        process.on('unhandledRejection', (e) => {
            log.send({ content: '```js\n' + require('util').inspect(e) + '```', disableMentions: 'all' });
        });

        // Twitter
        // const twitterStream = twit.stream('statuses/filter', { follow: ['1125044302055448577'] }),
        //     krunkerFeed = await client.channels.fetch(id.channels["krunker-feed"]);
        // twitterStream.on('tweet', (tweet) => {
        //     if (tweet.user.screen_name != 'krunkerio' || tweet.in_reply_to_status_id || tweet.in_reply_to_screen_name) return;
        //     krunkerFeed.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}/`).catch(console.error);
        // });
    }
});

client.on('messageCreate', async (message) => {

    // const caught = await filter(message);
    //if (caught) return;
    // Crosspost #change-logs
    if (env == 'PROD' && message.channel.id == id.channels['change-logs']) await message.crosspost().catch(console.error);
    // temp bypass
    if (env === 'PROD' && message.content.startsWith(`${config.prefix}execute`) && (message.author.id == id.users.jytesh || message.author.id == id.users.jj || message.author.id == id.users.ej) && message.channel.id == id.channels['bunker-bot-commands']) evald(message);

    setTimeout(async () => {
        if (env == 'PROD' && !message.deleted) {
            if (message.type == 'CHANNEL_PINNED_MESSAGE' && message.author.id == client.user.id) message.delete();
            if (message.author.bot || !message.guild) return; // Ignore bots and DMs

            // Global Filters
            if (message.activity != null && inviteBanChannels.includes(message.channel.id)) {
                var canSendInvite = false;
                // eslint-disable-next-line no-return-assign
                client.roles.staff.forEach(role => { if (message.member.roles.cache.has(role)) return canSendInvite = true; });
                if (!canSendInvite) return logger.messageDeleted(message, 'Game/Spotify Invite', 'BLURPLE');
            } else if (message.stickers && message.stickers.size != 0) {
                var canSendSticker = false;
                // eslint-disable-next-line no-return-assign
                client.roles.stickers.forEach(role => { if (message.member.roles.cache.has(role)) return canSendSticker = true; });

                if (!canSendSticker) return logger.messageDeleted(message, 'Sticker', 'BLURPLE');
            }

            var cmdToRun = '';

            // Public Commands
            switch (message.channel.id) {
                // case id.channels["looking-for-game"]:
                //     cmdToRun = 'lfg';
                //     break;
                case id.channels["bunker-bot-commands"] || id.channels["dev"]:
                    switch (message.content.split(' ')[0].substring(config.prefix.length)) {
                        case `info`:
                            cmdToRun = 'info';
                            break;
                        case `modlogs`:
                            cmdToRun = 'modlogs';
                            break;
                        case `p`:
                            cmdToRun = 'player';
                            break;
                        case `socials`:
                            if (message.member.roles.cache.has(id.roles.socials)) cmdToRun = 'socials';
                            break;
                    }
                    break;
                case id.channels["trading-board"]:
                    cmdToRun = 'trading';
                    break;
                case id.channels["market-chat"]:
                    switch (message.content.split(' ')[0].substring(config.prefix.length)) {
                        case `advisors`:
                            cmdToRun = 'advisors';
                            break;
                        case `stonks`:
                            cmdToRun = 'stonks';
                            break;
                    }
                    break;
                case id.channels["krunker-art"]:
                    cmdToRun = 'art';
                    break;
                case id.channels["report-hackers"]:
                    cmdToRun = 'reporthackers';
                    break;
                case id.channels["submissions"]:
                    cmdToRun = 'modmail';
                    break;
                case id.channels["random-chat"]:
                    if (message.content.includes('http')) {
                        var canBypass = false;
                        client.roles.link.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
                        if (!canBypass) logger.messageDeleted(message, 'Member Link', 'BLURPLE');
                    }
                    break;
            }

            // Staff Commands
            if (message.content.startsWith(`${config.prefix}staff`)) {
                let isStaff = false;
                // eslint-disable-next-line no-return-assign
                client.roles.staff.forEach(role => { if (message.member.roles.cache.has(role)) return isStaff = true; });
                if (isStaff) {
                    message.content = message.content.substring(message.content.indexOf(' ') + 1);
                    switch (message.content.split(' ')[0]) {
                        case 'email':
                        case 'emails':
                            cmdToRun = 'emails';
                            break;
                        case 'kpd':
                            cmdToRun = 'kpd';
                            break;
                        case 'roles':
                            cmdToRun = 'roles';
                            break;
                        case 'rule':
                            cmdToRun = 'rules';
                            break;
                        case 'domains':
                            cmdToRun = 'domains';
                            break;
                        case 'check':
                            cmdToRun = 'check';
                            break;

                    }
                }
            }

            // Market Commands
            if (message.content.startsWith(`${config.prefix}mkt`)) {
                let isMkt = false;
                // eslint-disable-next-line no-return-assign
                client.roles.mkt.forEach(role => { if (message.member.roles.cache.has(role)) return isMkt = true; });
                if (isMkt) {
                    message.content = message.content.substring(message.content.indexOf(' ') + 1);
                    switch (message.content.split(' ')[0]) {
                        case 'rule':
                            cmdToRun = 'mktRules';
                            break;
                    }
                }
            }

            if (message.content.startsWith(`${config.prefix}say`)) {
                let isAllowed = false;

                const allowedRoles = [id.roles.cm, '993096841841356880', '920723266195320883'];


                allowedRoles.forEach(role => { if (message.member.roles.cache.has(role)) return isAllowed = true; });


                if (isAllowed)
                    cmdToRun = 'say';
            }

            // Run Command
            if (cmdToRun != '') client.commands.get(`${cmdToRun}`).run(client, message);
        }
    }, 250);
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (env == 'PROD' && reaction.message.channel.id == id.channels["submissions-review"]) {
        if (user.bot) return; // Ignore bot reactions
        else client.commands.get('modmail').react(client, reaction, user);
    }
});

client.on('interactionCreate', async btn => {
    if (btn.isButton()) {
        const buttonCmd = client.buttons.get(btn.customId.split('_')[0]);
        if (env == 'PROD' && buttonCmd) {
            await buttonCmd(client, btn);
            if (!(btn.deferred === true || btn.replied === true)) return btn.reply({ content: 'Error. Please contact a bot dev.', ephemeral: true });
        } else return btn.reply({ content: 'Error. Please contact a bot dev. Button reply not found', ephemeral: true });
    } else if (btn.isSelectMenu()) {
        const menuCmd = client.menus.get('roleMenu');
        if (env == 'PROD' && menuCmd) {
            await menuCmd(client, btn);
            if (!(btn.deferred === true || btn.replied === true)) return btn.reply({ content: 'Error. Please contact a bot dev.', ephemeral: true });
        }
    }
});

// Weird stuff
async function evald(message) {
    try {
        let script = message.content.replace(`${config.prefix}execute `, '');
        if (script.includes('await')) script = `(async() => {${script}})()`;
        console.info(script);
        // eslint-disable-next-line no-eval
        let evaled = await eval(script);
        if (typeof evaled !== 'string') evaled = inspect(evaled);
        console.info(clean(evaled));
        message.channel.send({ content: clean(evaled), code: 'xl' });
    } catch (e) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(inspect(e))}\n\`\`\``);
    }
}

function clean(text) {
    if (typeof text === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)).substring(0, 1800);
    else return text;
}

async function getDomains() {
    const res = await fetch('http://api.phish.surf:5000/gimme-domains', { method: 'GET' });
    if (!res) return console.log('fishguard fail');
    const jsonRes = await res.json();
    global.domains = jsonRes;
}
async function filter(message) {
    let bypass = false;
    let isStaff = false;
    const str = message.content;
    const scamlogs = await client.channels.fetch(id.channels["scam-logs"]);
    const f = str.replace(/[^\x00-\x7F]/g, "");
    const embed = new MessageEmbed()
        .setAuthor('Phish Guard')
        .addField('Author', `${message.author.username}`, true)
        .addField('Channel', `<#${message.channel.id}>`, true)
        .addField('User ID', `${message.author.id}`, true);

    const whitelistarr = ['clips.twitch.tv', 'www.twitch.tv', 'discord.gift']
    for (listEl of whitelistarr) {
        if (f.includes(listEl)) {
            bypass = true;
            break;
        }
    }

    for (const role of client.roles.staff) {
        if (message.member.roles.cache.has(role)) {
            isStaff = true;
            break;
        }
    }
    for (const el of global.domains) {
        if (f.includes(el) && !bypass && !isStaff) {
            console.log(`caught by filter -----> ${f}`);
            embed.setDescription(`\`\`\`asciidoc\n= Raw =\n\u200b\n${str}\`\`\` \`\`\`asciidoc\n= Filtered =\n\u200b\n${f}\`\`\``);
            // eslint-disable-next-line no-await-in-loop
            scamlogs.send({ embeds: [embed] });
            // eslint-disable-next-line no-empty-function
            message.delete(() => { });
            return true;
        }
    }

}

// function filter(message) {
//     return new Promise(res => {
//         message.content.split('').forEach(x => {
//             // eslint-disable-next-line no-control-regex
//             if (/[^\x00-\x7F]/.test(x)) {
//                 message.delete().catch(() => {});
//                 res(true);
//             }
//         });
//     });
// }
