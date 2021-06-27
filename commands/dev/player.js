const id = require("../../id.json"),
    config = require('../../config.json');

module.exports.run = async(client, message) => {
    const KU = await client.channels.fetch(id.channels.ku)

    //Shortcut for self p
    if(message.content == `${config.prefix}p`) message.content = `${config.prefix}p ${message.author.id}`

    await KU.send(message.content)
    let send = 0;

    const messages = await KU.awaitMessages((msg)=>{
        return msg.attachments.size > 0},{max:1,time:30000,errors:['time']})
        .catch(e=>{
            console.error('API MESSAGE NOT RECEIVED',e)
            if(!send){
                send=1; 
                message.reply('Time out, Bot API is down!')
            }
        })
    if(messages && messages.size == 1){
        send = true
        const attachment = messages.first().attachments.first()
        message.reply({files:[attachment]})
    }else{
        console.error('API MESSAGE NOT RECEIVED','messages.size != 1')
            if(!send){
                send=1;
                message.reply('Time out, Bot API is down!');
            }
    }
}

module.exports.config = {
    name: 'player',
}