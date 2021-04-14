const { MessageEmbed } = require("discord.js"),
    config = require("../config.json");

module.exports.run = (client, message) => {
    const eb = new MessageEmbed()
        .setTitle('Info:')
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setColor("BLURPLE")
        .addField('Version:', `**${config.version}**`, true)
        .addField('Ping: ', `${client.ws.ping}ms`, true)
        .addField('Server Count: ', client.guilds.cache.size, true)
        .addField('User Count: ', client.guilds.cache.reduce((a, g) => { return a + g.memberCount }, 0), true)
        .setTimestamp()
        .setFooter('KrunkerLFG • Coming to get you');

    const time = client.uptime
    if (time / 86400000 > 1) {
        eb.addField('Uptime', (time / 86400000).toFixed(2) + 'd', true)
    } else if (time / 3600000 > 1) {
        eb.addField('Uptime', (time / 3600000).toFixed(2) + 'h', true)
    } else if (time / 60000 > 1) {
        eb.addField('Uptime', (time / 60000).toFixed(2) + 'm', true)
    } else if (time / 1000 > 1) {
        eb.addField('Uptime', (time / 1000).toFixed(2) + 's', true)
    } else {
        eb.addField(time + 'ms')
    }
    message.channel.send(eb)
}

module.exports.config = {
    name: "info",
}