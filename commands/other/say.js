const delay = require("delay");
const id = require("../../id.json"),
    { MessageEmbed, Client, Message, Channel } = require("discord.js");

module.exports.run = async(/** @type {Client} */client, /** @type {Message} */ message) => {

        const args = message.content.split(' ');
        args.shift();


        const channelId = args[0].replace(/\D/g, '');
        /** @type {import("discord.js").TextBasedChannels} */
        const channel = await client.channels.fetch(channelId).catch(console.log);


        if (!channel) {
            await message.channel.send(args.join(' ')).catch(console.log);
        } else {
            await channel.send(args.slice(1).join(' ')).catch(console.log);
        }
}

module.exports.config = {
    name: 'say',
}