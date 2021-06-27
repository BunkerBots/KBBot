const { MessageEmbed } = require("discord.js");

const rules = [
    ['', ''],
    ['Scamming is not tolerated.', 'Any member found to be scamming or attempting to scam others will be banned. This includes but is not limited to cashback scams, coinflip scams, KR for item scams, and listing fee scams. Scamming other scammers is also prohibited.'],
    ['No begging.', 'Excessive begging for trades, skins, or KR from other members is not allowed.'],
    ['No real world trading.', 'Do not attempt to sell accounts, skins, or KR for real money, this breaks Krunker terms of service and will result in any users involved having their accounts locked.'],
    ['Trade with caution.', 'While we do promote a safe trading environment, you may come across members that attempt to scam you, be aware of the risks when trading as all trades are final, and if you are scammed your items cannot be recovered.'],
    ['Krunker ToS.', 'Do not break Krunker terms of service or you will have your account locked. \nhttps://krunker.io/docs/terms.txt'],
];

module.exports.run = (client, message) => {
    const args = message.content.split(' '),
        rNum = args[1],
        mention = args.length > 2 && args[2].match(/<?@?!?(\d{17,19})>?/) ? args[2].replace('<@', '').replace('!', '').replace('>', '') : null;
    if (!(rNum > 0 && rNum < 6)) return;

    message.channel.send({ 
        content: mention != null ? `<@${mention}>,` : undefined,
        embeds: [
            new MessageEmbed()
                .setTitle(`__**Rule ${rNum}**__ - **${rules[rNum][0]}**`)
                .setColor('#ffd1dc')
                .setDescription(`${rules[rNum][1]}`)
                .setTimestamp()
        ],
    });
}

module.exports.config = {
    name: 'mktRules',
}