const fetch = require('node-fetch');

module.exports.run = async (client, message) => {
    const args = message.content.split(' ');
    args.splice(0, 1);
    const val = args.join(' ');
    if (global.domains.find(x => x == val)) 
        return message.channel.send({ content: `The domain ${val} exists in the filter`});
    else 
        return message.channel.send({ content: `The domain ${val} does not exist in the filter` });
}

module.exports.config = {
    name: 'check',
}

