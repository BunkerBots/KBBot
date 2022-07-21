const id = require('../../id.json'),
    {
        MessageEmbed
    } = require("discord.js");

module.exports.run = (client, message) => {
    const args = message.content.split(' '),
        mention = args.length > 1 && args[1].match(/<?@?!?(\d{17,19})>?/) ? args[1].replace('<@', '').replace('!', '').replace('>', '') : null;

    const embedObj = {
        "content": null,
        "embeds": [{
            "title": "__Level Roles & Perks__",
            "description": "Check your level by using the `!rank` command in <#534605414139166722>\nEvery minute that you're chatting, you can gain between 15 and 25 XP",
            "color": 16763904,
            "fields": [{
                    "name": "<:Blank:860122601849487410>",
                    "value": "`Media & Links   `\n`Sticker access  `\n`Streaming perms `\n`Special channels`\n`Reaction perms  `",
                    "inline": true
                },
                {
                    "name": "<:Blank:860122601849487410>",
                    "value": "**10:** <@&719686530318467093>\n**20:** <@&675168719827238941>\n**30:** <@&674746305624408064>\n**40:** <@&675169426378850314>\n**50:** <@&855046303816744970>",
                    "inline": true
                },
                {
                    "name": "<:Blank:860122601849487410>",
                    "value": "**60:** <@&675536682602463274>\n**70:** <@&848418015816581150>\n**80:** <@&855047548795748352>\n**90:** <@&855047816712028190>\n**100:** <@&855048057754091530>",
                    "inline": true
                }
            ],
            "footer": {
                "text": "The first five roles between level 10-50 give additional perms\nThe following five between level 60-100 are simply vanity roles"
            }
        }],
        "attachments": []
    }

    message.channel.send({
        content: mention != null ? `<@${mention}>,` : undefined,
        embeds: [
            new MessageEmbed()
            .setTitle('MEE6 Roles:')
            .setColor('BLURPLE')
            .setAuthor('MEE6', 'https://cdn.discordapp.com/avatars/159985870458322944/b50adff099924dd5e6b72d13f77eb9d7.png')
            .setDescription(`Check your level by using the \`!rank\` command in <#${id.channels['bot-comamnds']}>`)
            .addField('How it works:', 'Every minute that you\'re messaging, you randomly gain between 15 and 25 XP. \n\nTo avoid spamming, earning XP is limited to once a minute per user.')
            .addField('Level 10:', `<@&${id.roles.rookie}> \n\`\`\`diff\n+ Media and link perms.\n\`\`\``, true)
            .addField('Level 20:', `<@&${id.roles.novice}> \n\`\`\`diff\n+ Sticker perms.\n\`\`\``, true)
            .addField('Level 30:', `<@&${id.roles.active}> \n\`\`\`diff\n+ Streaming and video perms.\n\`\`\``, true)
            .addField('Level 40:', `<@&${id.roles.apprentice}> \n\`\`\`diff\n+ Special channel and VC.\n\`\`\``, true)
            .addField('Level 50:', `<@&${id.roles.devoted}> \n\`\`\`diff\n+ Reaction perms.\n\`\`\``, true)
            .addField('Level 60:', `<@&${id.roles.legendary}>`, true)
            .addField('Level 70:', `<@&${id.roles.mythical}>`, true)
            .addField('Level 80:', `<@&${id.roles.nolife}>`, true)
            .addField('Level 90:', `<@&${id.roles.godly}>`, true)
            .addField('Level 100:', `<@&${id.roles.ascended}>`, true)
            .setTimestamp()
        ]
    });
}

module.exports.config = {
    name: 'roles',
}
