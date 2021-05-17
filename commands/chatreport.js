const id = require("../id.json"),
    { MessageEmbed, MessageAttachment, Message } = require("discord.js"),
    chatreport_db = require('../app').db.chatreports,
    moderator_db = require('../app').db.moderator,
    logger = require("../logger");

module.exports.run = async(client, message) => {
    message.delete();
    message.channel.send(new MessageEmbed()
        .setColor("BLURPLE")
        .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
        .setTitle("Please confirm your request:")
        .setDescription("Misuse or abuse of the chat report system may lead to punishments by moderators. \nDo you wish to continue with this call for moderator help?")
        .addField("**Note**:", "Your DMs must be open to this bot in order to continue.")
        .setTimestamp()
    ).then(async(m) => {
        await m.react(client.emojis.cache.get(id.emojis.yes));
        await m.react(client.emojis.cache.get(id.emojis.no));

        const reactionsConfirmStart = await m.awaitReactions((reaction, user) => {
            return user.id == message.author.id;
        }, { time: 120000, max: 1 });
        m.delete();
        if (reactionsConfirmStart.size == 0 || reactionsConfirmStart.first().emoji.id != id.emojis.yes) {
            message.channel.send(new MessageEmbed()
                .setColor("RED")
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                .setTitle('Request Cancelled')
                .setTimestamp()
            ).then(msg => {
                msg.delete({ timeout: 7000 });
            });
            return;
        } else {
            a(client, message);
        }
    });
}

async function a(client, message) {
    message.channel.send(new MessageEmbed()
        .setColor("GREEN")
        .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
        .setTitle('Request Confirmed')
        .setDescription('Please check your DMs with the bot to continue.')
        .setTimestamp()
    ).then(msg => {
        msg.delete({ timeout: 7000 });
    });

    const fetchData = await chatreport_db.get(message.guild.id);
    const caseID = fetchData.subID;
    await chatreport_db.set(message.guild.id, { subID: caseID + 1 });

    message.author.createDM().then(async(dm) => {
        b(client, message, dm, caseID);
    });
}

async function b(client, message, dm, caseID) {
    while (true) {
        dm.send(new MessageEmbed()
            .setColor("BLURPLE")
            .setTitle(`Krunker Bunker Chat Support - Case #${caseID}`)
            .setDescription('What channel is help required in? Please provide the channel ID:')
            .addField('What is/how to get the channel ID?', '[See here](https://i.imgur.com/RVyzR4U.gif)')
            .setTimestamp()
        );
        const replyMessage = await dm.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 120000, errors: ['time'] }).catch(() => {
            return dm.send(`Timeout. Please create a new help thread.`);
        });
        const channelID = replyMessage.first().content;
        if (!client.guilds.resolve(id.guilds.kb).channels.cache.has(channelID)) dm.send(`Channel not found. Please try again.`);
        else {
            dm.send(new MessageEmbed()
                .setColor('YELLOW')
                .setTitle('Confirm')
                .setDescription(`Please confirm that you are requesting help in <#${channelID}>`)
                .setTimestamp()
            ).then(async(confirmChannelMsg) => {
                await confirmChannelMsg.react(client.emojis.cache.get(id.emojis.yes));
                await confirmChannelMsg.react(client.emojis.cache.get(id.emojis.no));

                c();
            });
        }
    }
}

async function c() {
    const reactionsConfirmChannel = await m.awaitReactions((reaction, user) => {
        return user.id == message.author.id;
    }, { time: 120000, max: 1 });
    if (reactionsConfirmChannel.size == 0 || reactionsConfirmChannel.first().emoji.id != id.emojis.yes) {
        confirmChannelMsg.embeds[0].setColor('RED');
        return dm.send(new MessageEmbed()
            .setColor('RED')
            .setTitle('Help cancelled.')
            .setTimestamp()
        );
    } else {
        dm.send(`<#${channelID}>`);
        dm.send("The rest isn't done yet");
    }
}

module.exports.config = {
    name: 'chatreport',
}