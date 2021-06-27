const logger = require('../../logger');

const roles = [
    '692870902005629041', //Trial Mod
    '448207247215165451', //Mod
    '448195089471111179', //CM
    '638129127555072028', //Yendis
    '448198031041495040', //Dev
];

module.exports.run = (client, message) => {
    var canBypass = false;
    if (!canBypass) roles.forEach(role => { if (message.member.roles.cache.has(role)) canBypass = true; return });
    if (!canBypass && message.attachments.size == 0) logger.messageDeleted(message, 'No attachment', 'ORANGE');
}

module.exports.config = {
    name: 'art',
}