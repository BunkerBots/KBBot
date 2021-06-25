const { MessageEmbed } = require("discord.js");

module.exports = {
    messageDeleted(message, reason, colour) {
        message.client.channels.cache.get('770758419737083944').sendEmbed(new MessageEmbed()
            .setTitle('Message Deleted')
            .setColor(colour)
            .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
            .setDescription(`► Channel: **${message.channel.name}** \n► Message ID: ${message.id} \n► Content: \n${message.content}`)
            .addField('Reason:', reason)
            .setFooter('No more KR, yall are boring', message.client.user.displayAvatarURL())
            .setTimestamp());
        if (message.deletable) message.delete();
    }
}