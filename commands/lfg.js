const { MessageEmbed } = require("discord.js"),
    logger = require('../logger'),
    fetch = require("node-fetch");

const regions = {
    AFR: 'AQUA',
    BHN: 'GREEN',
    BLR: 'BLUE',
    BRZ: 'PURPLE',
    DAL: 'GOLD',
    FRA: 'ORANGE',
    MIA: 'GREY',
    NY: 'DARKER_GREY',
    SIN: 'NAVY',
    SV: 'DARK_AQUA',
    SYD: 'DARK_GREEN',
    TOK: 'DARK_BLUE',
};

module.exports.run = async(client, message) => {
    const args = message.content.indexOf('$lfg') == 0 ? message.content.substring(5).split(' ') : message.content.split(' ');
    const link = args.shift();

    if (link.indexOf("https://krunker.io/?") == 0) { //Checks if its a krunker game link
        let eb = new MessageEmbed()
            .setAuthor(message.author.tag + ' (' + message.author.id + ')', message.author.avatarURL(), null)
            .setTitle(message.member.displayName + ' is looking to party! :tada:')
            .addField('Link: ', link)
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setTimestamp();

        if (args.length > 0) {
            const desc = args.join(' ');
            if (desc.indexOf('krunker.io') == -1) eb.setDescription(desc.toUpperCase() ? desc.toLowerCase() : desc);
        }

        if (link.indexOf("https://krunker.io/?game=") == 0) {
            const game = await getLinkInfo(link).catch(console.error);
            if (game) {
                const map = await getMapInfo(game.map).catch(console.error);
                if (map)
                    if (map.thumbnail) eb.setImage(map.thumbnail);
                eb.setColor(regions[game.region])
                    .addField('Players', game.players, true)
                    .addField('Map', game.map, true)
                    .addField('Game Mode', game.mode, true)

                message.channel.send({ content: `<@${message.author.id}>,`, embeds: [eb] }).then(msg => { msg.delete({ timeout: 600000 }) }).catch(console.error);
                autodel(message);
            } else {
                message.channel.send({
                    content: `<@${message.author.id}>,`, embeds: [
                        new MessageEmbed()
                        .setColor('RED')
                        .setTitle('Error')
                        .setDescription('Invalid game link.')
                        .setTimestamp()
                        .setFooter(`${message.member.displayName} (${message.author.tag})`, message.author.avatarURL())
                    ]
                }).then(msg => { msg.delete({ timeout: 7000 }) }).catch(console.error);
            }
        } else if (link.indexOf('https://krunker.io/?party=') == 0 && link.split('=')[1].length == 6) {
            eb.setColor('BLACK')
            message.channel.send({ content: `<@${message.author.id}>,`, embeds: [eb] }).then(msg => { msg.delete({ timeout: 300000 }) }).catch(console.error);
            autodel(message);
        } else {
            error(message)
        }
    } else {
        error(message)
    }
    logger.messageDeleted(message, 'LFG', 'DARK_VIVID_PINK');
}

function error(message) {
    message.channel.send({
        content: `<@${message.author.id}>,`, embeds: [
            new MessageEmbed()
            .setColor('RED')
            .setTitle('Error')
            .setDescription('Misuse of <#688434522072809500>. Please only send game links with an optional description afterwards.')
            .setTimestamp()
            .setFooter(`${message.member.displayName} (${message.author.tag})`, message.author.avatarURL())
        ]
    }
    ).then(msg => { msg.delete({ timeout: 7000 }) }).catch(console.error);
}

function autodel(message) {
    message.channel.messages.fetch({ limit: 100 }, false, true).then(messages => {
        messages.array().forEach(m => {
            if (m.content.includes(message.author.id)) m.delete();
        });
    });
}

function getLinkInfo(link) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async(resolve, reject) => {
        link = link.split("=")[1]
        if (!link) {
            return reject(new Error(false));
        } else {
            const options = {
                headers: {
                    'authority': 'matchmaker.krunker.io',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                    'origin': 'https://krunker.io',
                    'scheme': 'https',
                    'referer': 'https://krunker.io/',
                }
            }
            const res = await fetch(`https://matchmaker.krunker.io/game-info?game=${link}`, options);
            const json = await res.json().catch(error => { reject(new Error('JSON', error)) });

            if (!json) reject(new Error('JSON', error));
            if (!json.error) {
                resolve({
                    region: json[0].split(":"),
                    players: `${json[2]}/${json[3]}`,
                    mode: ['FFA','TDM','CTF','POINT'][json[4].g] || 'Unknown',
                    map: json[4].i,
                });
            } else {
                reject(new Error('404', json));
            }
        }
    });
}

function getMapInfo(name) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async(resolve, reject) => {
        const options = {
            uri: `https://api.krunker.io/search?type=map&val=${name}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                'origin': 'https://krunker.io',
            },
            json: true, // Automatically parses the JSON string in the response
        };
        const res = await fetch(`https://api.krunker.io/search?type=map&val=${name}`, options);
        const json = await res.json().catch(error => { reject(new Error('JSON', error)) });
        if (!json) reject(new Error('JSON', error));
        if (!json.error) {
            const map = json.data[0];
            if (!map) reject(new Error('Map Not Found', json))
            resolve({
                id: map.map_id,
                name: map.map_name,
                creator: map.creatorname,
                description: map.map_description,
                votes: map.map_votes,
                verified: map.map_verified,
                date: new Date(map.map_date).toUTCString().split(' ').splice(0, 4).join(' '),
                info: map.map_info,
                updatecounter: map.map_updatecounter,
                featured: map.map_featured,
                fund: map.fund,
                thumbnail: map.map_info == { 't': 1 } ? `https://user-assets.krunker.io/m${map.map_id}/thumb.png` : null
            });
        } else {
            reject(new Error('404', json));
        }
    });
}

module.exports.config = {
    name: "lfg",
}