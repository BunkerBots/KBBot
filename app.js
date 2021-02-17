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
        submissions: submissions_db = new Mongo(process.env.DB_URL, { db: 'serverConfigs', coll: 'submissions', init: true }),
        moderator: moderator_db = new Mongo(process.env.DB_URL, { db: 'userConfigs', coll: 'moderators', init: true }),
    },
    staffRoles = [id.roles.dev, id.roles.yendis, id.roles.cm, id.roles.mod, id.roles.tmod],
    stickerRoles = staffRoles.concat([id.roles.socials, id.roles.devoted]),
    randomRoles = staffRoles.concat([id.roles.novice]);

(async function init() { Object.keys(db).forEach(async t => await db[t].connect().catch(console.log)); })();

let env;
if (process.argv[2] == 'test' || !process.argv[2]) env = 'DEV';
else env = 'PROD';

//Loading commands from /commands directory, to client
client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) return console.log("[KB Bot] There aren't any commands!"); //JJ has fucked up
    jsfile.forEach((f, i) => {
        const pull = require(`./commands/${f}`)
        client.commands.set(pull.config.name, pull);
    });
});

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
    }
});

client.on('message', async(message) => {
    client.setTimeout(async() => {
        if (!message.deleted) {
            if (message.author.bot) return; // This will prevent bots from using the bot. Lovely!

            if (!message.guild) {
                return message.reply(new Discord.MessageEmbed()
                    .setTitle('‼ Heads Up ‼')
                    .setColor('BLURPLE')
                    .setDescription(`Please message <#${id.channels.submissions}> if you would like to submit a request for a suggestion, clan board, etc.`)
                    .addField('Issues?', `If you are experiencing problems or issues with me, please contact JJ_G4M3R#2155 or Jytesh#3241`)
                    .setFooter('Krunker Bunker Bot by JJ_G4M3R & Jytesh')
                    .setTimestamp());
            }

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
                        var canBypass = false;
                        randomRoles.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
                        if (!canBypass) logger.messageDeleted(message, 'Random Chat Link', 'BLURPLE');
                    }
                    break;
                case id.channels["submissions"]:
                    client.commands.get('modmail').run(client, message);
                    break;
            }

            if (env == 'PROD' && message.guild.id == id.guilds.kb && message.content == '' && message.embeds.length == 0 && message.attachments.keyArray().length == 0) {
                var canBypass = false;
                stickerRoles.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
                if (!canBypass) logger.messageDeleted(message, 'Sticker/Invite', 'BLURPLE');
            }
        }
    }, 250);
});

client.on('messageReactionAdd', async(reaction, user) => {
    if (user.bot) return; // Ignore bot reactions
    if (reaction.message.channel.id == id.channels["submissions-review"]) client.commands.get('modmail').react(client, reaction, user);
});

module.exports = {
    client: client,
    db: db,
    staffRoles: staffRoles,
}