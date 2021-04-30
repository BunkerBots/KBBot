// Load dependencies
require('dotenv').config();
const config = require('./config.json'),
    id = require('./id.json'),
    Discord = require('discord.js'),
    client = new Discord.Client({ fetchAllMembers: false, partials: ['GUILD_MEMBER', 'REACTION', 'USER', 'MESSAGE'] }),
    fs = require('fs'),
    logger = require('./logger'),
    Mongo = require('./mongo.js'),
    db = {
        chatreports: new Mongo(process.env.DB_URL, { db: 'serverConfigs', coll: 'chatreports', init: true }),
        submissions: new Mongo(process.env.DB_URL, { db: 'serverConfigs', coll: 'submissions', init: true }),
        moderator: new Mongo(process.env.DB_URL, { db: 'userConfigs', coll: 'moderators', init: true }),
    },
    Twit = require('twit'),
    staffRoles = [id.roles.dev, id.roles.yendis, id.roles.cm, id.roles.mod, id.roles.tmod],
    stickerRoles = staffRoles.concat([id.roles.socials, id.roles.active, id.roles.devoted, id.roles.legendary, id.roles.godly, id.roles.nolife]),
    randomRoles = staffRoles.concat([id.roles.novice, id.roles.active, id.roles.devoted, id.roles.legendary, id.roles.godly, id.roles.nolife]);

const twit = new Twit({
    consumer_key:         process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
    access_token:         process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000, // optional HTTP request timeout to apply to all requests.
    strictSSL:            true, // optional - requires SSL certificates to be valid.
     
});

(async function init() { Object.keys(db).forEach(async t => await db[t].connect().catch(console.log)); })();

let env;
if (process.argv[2] == 'test' || !process.argv[2]) env = 'DEV';
else env = 'PROD';

//Loading commands from /commands directory, to client
client.commands = new Discord.Collection();
module.exports = {
    client: client,
    db: db,
    staffRoles: staffRoles,
}

const files = fs.readdirSync("./commands/");
const jsFiles = files.filter(f => f.split(".").pop() === "js");
if (jsFiles.length <= 0) return console.log("[KB Bot] There aren't any commands!"); //JJ has fucked up
for (const f of jsFiles) {
    const pull = require(`./commands/${f}`)
    client.commands.set(pull.config.name, pull);
}

//Login
client.login(process.env.TOKEN);

//Event Handlers
client.on('ready', async() => {
    console.log('[Krunker Bunker Bot] ready to roll!');

    if (env == 'PROD') {
        client.user.setActivity('#submissions', { type: "WATCHING" });

        client.channels.resolve(id.channels["bunker-bot-commands"]).send(config.version);

        client.channels.resolve(id.channels["looking-for-game"]).messages.fetch({ limit: 100 }, false, true).then(messages => {
            messages.array().forEach(m => {
                logger.messageDeleted(m, 'Bot reboot autodel', 'AQUA')
            });
        });
        client.channels.resolve(id.channels["report-hackers"]).messages.fetch({ limit: 100 }, false, true).then(messages => {
            messages.array().forEach(m => {
                if (m.author.id == id.users.kbbot) m.delete({ timeout: 20000 });
                else if (m.author.id != id.users.vortx && m.author.id != id.users.jj) client.commands.get('reporthackers').run(client, m);
            });
        });
        const log = await client.channels.fetch(id.channels["log"]);
        process.on('uncaughtException', (e) => {
            log.send('```js\n' + require('util').inspect(e) + '```', { disableMentions: 'all'})
        });

        process.on('unhandledRejection', (e) => {
            log.send('```js\n' + require('util').inspect(e) + '```', { disableMentions: 'all'})
        });

        const twitterStream = twit.stream('statuses/filter', { follow: ['1125044302055448577', '1119940815533424640']});
        const twitterChannel = await client.channels.fetch(id.channels["krunker-feed"]);
        console.log(twitterStream);
        twitterStream.on('tweet', (tweet) => {
            console.info('TWITTER: ', tweet)
            const url = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
            twitterChannel.send(url).catch(console.log);
        })
    }
});

client.on('message', async(message) => {
    if (env != 'PROD' && !message.author.bot && message.channel.id == id.channels['call-channel']) client.commands.get('chatreport').run(client, message);

    client.setTimeout(async() => {
        if (!message.deleted && env == 'PROD') {
            if (message.author.bot) return; // This will prevent bots from using the bot. Lovely!

            if (!message.guild) return;

            let canBypass = false;
            switch (message.channel.id) {
                case id.channels["looking-for-game"]:
                    client.commands.get('lfg').run(client, message);
                    break;
                case id.channels["bunker-bot-commands"] || id.channels["dev"]:
                    var cmdToRun = '';
                    switch (message.content.split(' ')[0]) {
                        case `${config.prefix}info`:
                            cmdToRun = 'info';
                            break;
                        case `${config.prefix}lfg`:
                            cmdToRun = 'lfg';
                            break;
                        case `${config.prefix}modlogs`:
                            cmdToRun = 'modlogs';
                            break;
                        case `${config.prefix}p`:
                            cmdToRun = 'player';
                            break;
                        case `${config.prefix}socials`:
                            if (message.member.roles.cache.has(id.roles.socials) || message.author.id == id.users.jj) cmdToRun = 'socials';
                            break;
                    }
                    if (cmdToRun != '') client.commands.get(`${cmdToRun}`).run(client, message);
                    break;
                case id.channels["trading-board"]:
                    client.commands.get('trading').run(client, message);
                    break;
                case id.channels["market-chat"]:
                    client.commands.get('market').run(client, message);
                    break;
                case id.channels["krunker-art"]:
                    client.commands.get('art').run(client, message);
                    break;
                case id.channels["report-hackers"]:
                    client.commands.get('reporthackers').run(client, message);
                    break;
                case id.channels["random-chat"]:
                    if (message.content.includes('http')) {
                        console.log(canBypass);
                        randomRoles.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
                        console.log(canBypass, message.member.roles.cache.keyArray())
                        if (!canBypass) logger.messageDeleted(message, 'Random Chat Link', 'BLURPLE');
                    }
                    break;
                case id.channels["submissions"]:
                    client.commands.get('modmail').run(client, message);
                    break;
            }

            if (message.content.startsWith(`${config.prefix}rule`)) {
                let isStaff = false;
                staffRoles.forEach(role => { if (message.member.roles.cache.has(role)) isStaff = true; return; });
                if (isStaff) client.commands.get('rules').run(client, message);
            }

            if (message.guild.id == id.guilds.kb && message.content == '' && message.embeds.length == 0 && message.attachments.keyArray().length == 0) {
                canBypass = false;
                stickerRoles.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
                if (!canBypass) logger.messageDeleted(message, 'Sticker/Invite', 'BLURPLE');
            }
        }
    }, 250);
});

client.on('messageReactionAdd', async(reaction, user) => {
    if (env == 'PROD') {
        if (user.bot) return; // Ignore bot reactions
        else if (reaction.message.channel.id == id.channels["submissions-review"]) client.commands.get('modmail').react(client, reaction, user);
    }
});