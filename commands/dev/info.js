const { MessageEmbed } = require("discord.js"),
    config = require("../../config.json");

module.exports.run = (client, message) => {
    message.channel.sendEmbed(new MessageEmbed()
        .setTitle('Info:')
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setColor("BLURPLE")
        .addField('Version:', `**${config.version}**`, true)
        .addField('Ping:', `${client.ws.ping}ms`, true)
        .addField('Uptime:', `${new Date(client.uptime).toISOString().slice(11, -1)}`)
        .setTimestamp()
        .setFooter('KrunkerLFG • Coming to get you')).then(m => message.channel.send("hi"));
}

module.exports.config = {
    name: "info",
}