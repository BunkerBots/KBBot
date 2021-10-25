const fetch = require('node-fetch');

module.exports.run = async (client, message) => {
    const msg = await message.channel.send({ content: 'Updating domains cache ...'})
    const res = await fetch('http://api.phish.surf:5000/gimme-domains', { method: 'GET' });
    if (!res) return message.channel.send({ content: 'updating domains failed. Please contact a developer'});
    const jsonRes = await res.json();
    global.domains = jsonRes;
    msg.delete();
    message.channel.send({ content: 'Updated domains cache' });
}

module.exports.config = {
    name: 'domains',
}

