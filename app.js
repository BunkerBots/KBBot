// Load dependencies
require('dotenv').config();
const config = require('./config.json'),
    id = require('./id.json'),
    { inspect } = require('util'),
    Discord = require('discord.js'),
    client = new Discord.Client({ fetchAllMembers: false, partials: ['GUILD_MEMBER', 'REACTION', 'USER', 'MESSAGE'] }),
    fs = require('fs'),
    logger = require('./logger'),
    Mongo = require('./mongo.js'),
    // eslint-disable-next-line no-unused-vars
    { MessageButton } = require('discord-buttons'), 
    // eslint-disable-next-line no-unused-vars
    disbut = require('discord-buttons')(client),
    db = {
        chatreports: new Mongo(process.env.DB_URL, { db: 'serverConfigs', coll: 'chatreports', init: true }),
        submissions: new Mongo(process.env.DB_URL, { db: 'serverConfigs', coll: 'submissions', init: true }),
        moderator: new Mongo(process.env.DB_URL, { db: 'userConfigs', coll: 'moderators', init: true }),
    },
    Twit = require('twit'),
    staffRoles = [id.roles.dev, id.roles.yendis, id.roles.cm, id.roles.mod, id.roles.tmod],
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

    client.buttons = loadButtons();
    client.on('clickButton', async btn => {
        const identifier = btn.id.split('_')[0];
        const buttonCmd = client.buttons.get(identifier);
        if (buttonCmd) {
            await buttonCmd(client, btn);
            if (!(btn.deferred === true || btn.replied === true)) return btn.reply.send('oops, dm a dev lol')
        } else return btn.reply.send('oops, dm a dev lol')
    });

    if (env == 'PROD') {
        client.user.setActivity('#submissions', { type: "WATCHING" });
       

        const bunkerBotCommands = client.channels.resolve(id.channels["bunker-bot-commands"])
        bunkerBotCommands.send(config.version);

        client.on('log', (...args) => {
            bunkerBotCommands.send(args.map(x => {
                if (typeof x == 'string') return x;
                else return require('util').inspect(x);
            }).join('\n\n'))
        });
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

        const twitterStream = twit.stream('statuses/filter', { follow: ['1125044302055448577']});
        const twitterChannel = await client.channels.fetch(id.channels["krunker-feed"]);
        twitterStream.on('tweet', (tweet) => {
            console.info('TWITTER: ', tweet)
            if (tweet.user.screen_name != 'krunkerio') return;
            if (tweet.in_reply_to_status_id || tweet.in_reply_to_screen_name) return;
            const url = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
            twitterChannel.send(url).catch(console.log);
        })
    }
});

client.on('message', async(message) => {
    // Crosspost change logs
    if (env == 'PROD' && message.channel.id == id.channels['change-logs']) await message.crosspost().catch(console.error);

    client.setTimeout(async() => {
        if (!message.deleted && env == 'PROD') {
            if (message.author.bot || !message.guild) return;

            // Public commands
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
                        case `${config.prefix}execute`:
                            if ((message.author.id == id.users.jytesh || message.author.id == id.users.jj || message.author.id == id.users.ej) && message.channel.id == id.channels['bunker-bot-commands']) {
                                evald(message);
                            }
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
                        var canBypass = false;
                        randomRoles.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
                        if (!canBypass) logger.messageDeleted(message, 'Random Chat Link', 'BLURPLE');
                    }
                    break;
                case id.channels["submissions"]:
                    client.commands.get('modmail').run(client, message);
                    break;
            }

            // Staff commands
            if(message.content.startsWith(`${config.prefix}staff`)) {
                let isStaff = false;
                staffRoles.forEach(role => { if (message.member.roles.cache.has(role)) isStaff = true; return; });
                if (isStaff) {
                    message.content = message.content.substring(message.content.indexOf(' ') + 1);
                    switch(message.content.split(' ')[0]) {
                        case 'rule':
                            client.commands.get('rules').run(client, message);
                            break;
                        case 'emails':
                            client.commands.get('emails').run(client, message);
                            break;
                        case 'roles':
                            client.commands.get('roles').run(client, message);
                            break;
                    }
                }
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

async function evald(message) {
    try {
        let script = message.content.replace(`${config.prefix}execute `, '');
        if (script.includes('await'))
            script = `(async() => {${script}})()`;
        console.log(script);
        // eslint-disable-next-line no-eval
        let evaled = await eval(script);
        if (typeof evaled !== 'string')
            evaled = inspect(evaled);
        console.log(clean(evaled));
        message.channel.send(clean(evaled), { code: 'xl' });
    } catch (e) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(inspect(e))}\n\`\`\``);
    }
}

function clean (text) {
    if (typeof text === 'string')
        return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)).substring(0, 1800);
    else
        return text;
}

/**
 * @returns {Collection} Collection with buttons
 */
function loadButtons() {
    const buttons = new Discord.Collection();
    const dir = fs.readdirSync('./buttons').filter(x => x.includes('.js'));
    for (const file of dir) {
        const buttonsFile = require(`./buttons/${file}`);
        buttons.set(file.split('.')[0], buttonsFile);
    }
    return buttons
}