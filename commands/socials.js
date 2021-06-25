const id = require("../id.json"),
    { MessageEmbed } = require("discord.js");

module.exports.run = async(client, message) => {
        message.suppressEmbeds();

        const prompt = await message.channel.send(`<@${message.author.id}> Enable notif ping?`);
        const ping = await message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 60000, errors: ['time'] }).catch(() => {
            message.channel.send(`<@${message.author.id}> Timeout. Reply faster next time you 4head.`).then(m => m.delete({ timeout: 7000 }));
            prompt.delete();
            return;
        });
        const pingEnabled = ping.first().content.toLowerCase() == 'yes' ? true : false;
        prompt.delete();
        ping.first().delete();

        client.channels.resolve(id.channels["krunker-feed"]).send(`${pingEnabled ? `<@&${id.roles.socialsnotif}>` : ''}${message.content.substring(message.content.indexOf(' '))}`);
        message.reply({
            embeds: new MessageEmbed()
                .setColor('#00ff0a')
                .setTitle('Social Thingy')
                .setDescription(`Success! Post is now public in <#${id.channels["krunker-feed"]}>`)
                .addField('Ping Enabled?', `${pingEnabled ? 'Yes' : 'No'}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                .setTimestamp()
        });
}

module.exports.config = {
    name: 'socials',
}