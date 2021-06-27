const { MessageEmbed } = require("discord.js");

module.exports.run = (client, message) => {
    message.channel.sendEmbed(new MessageEmbed()
        .setTitle('Advisors')
        .setDescription('Here is a list of users who are known to be knowledgeable about the Krunker market. This list of users is provided for your convenience. Krunker Bunker as a server claims no responsibility for the advice or actions of these advisors. However, if you wish to file a complaint against any of these users for their actions as an advisor, you may contact @JJ_G4M3R#2155.')
        .setColor('GREEN')
        .addField('Current Advisors:', '**N/A** \nMarket re-work in progress...')
        .setTimestamp());
}

module.exports.config = {
    name: 'advisors',
}