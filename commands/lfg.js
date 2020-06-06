const {MessageEmbed} = require("discord.js")
const config = require("../config.json")
const utils = require("../utils")
const db =require("../json.db")
//const {NA,EU,OCE,AS} = require("../utils.js").channels
const {ffa, tdm, ctf, point, party, other} = require('../utils.js').gamemodes

module.exports.run = async(client,message)=>{
    let args = message.content.split(' ');
    const link = args.shift();
    
    if(link.indexOf("https://krunker.io/?") == 0){ //Checks if its a krunker game link
        let eb = new MessageEmbed()
            .setTitle(message.member.displayName + ' is looking to party! :tada:')
            .setAuthor(message.member.displayName + ' (' + message.author.tag + ')', message.author.avatarURL(), null)
            .addField('Link: ', link)
            .setFooter('KrunkerLFG')
            .setTimestamp()
            
        if(args.length > 1) {
            var desc = args.join(' ')
            eb.setDescription(desc == desc.toUpperCase() ? desc.toLowerCase() : desc)
        }
        
        if(link.indexOf("https://krunker.io/?game=") == 0 && link.split('=')[1].split(':')[1].length == 5) {
            switch(link.split('=')[1].split(':')[0]) {
                case 'SV':
                    eb.setColor('BLURPLE')
                    break;
                case 'MIA':
                    eb.setColor('BLUE')
                    break;
                case 'NY':
                    eb.setColor('AQUA')
                    break;
                case 'FRA':
                    eb.setColor('GOLD')
                    break;
                case 'TOK':
                    eb.setColor('ORANGE')
                    break;
                case 'SIN':
                    eb.setColor('LUMINOUS_VIVID_PINK')
                    break;
                case 'BLR':
                    eb.setColor('DARK_VIVID_PINK')
                    break;
                case 'SYD':
                    eb.setColor('GREEN')
                    break;
            }
            message.channel.send(eb);
        }else if(link.indexOf('https://krunker.io/?party=') == 0 && link.split('=')[1].length == 6) {
            eb.setColor('BLACK')
            message.channel.send(eb);
        }else{
            error()
        }
    }else{
        error()
    }
    if(message.channel.id == '688434522072809500') message.delete
}

function error() {
    message.channel.send(new MessageEmbed()
        .setColor('RED')
        .setTitle('Error')
        .setDescription('Misuse of <#688434522072809500>. Please only send game links with an optional description afterwards.')
        .setTimestamp()
        .setFooter(`${message.member.displayName} (${message.author.tag})`, message.author.avatarURL())
    )
}

module.exports.config = {
    name : "lfg",
    aliases : ["looking", "lf", "lfm"],
    type: "General"
}
module.exports.help = {
    usage : `lfg <link> [message]`, //Example usage of command
    User : 2, //Who this command can be used by, 1 for Everyone 2 for Restricted Roles 3 for Moderators and 4 for Admins 5 for Server Owner
    description : `Creates an LFG posting with <link> and [message].` //Description to come when you use prefix help <command name>
}