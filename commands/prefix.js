const Discord = require("discord.js");
const client=require("../variables/client.js");
const db=require("../database/db.js");


exports.run = async (message, args) =>{
    if(args.length===0) return message.reply("prefix cannot be empty!");
    if(!(args.length===1)) return message.reply("prefix cannot contain spaces!");
    if(args[0].length>5) return message.reply("prefix length cannot be longer than 5 characters!");
    const prefix=args[0].toLowerCase()

    db.query(`UPDATE guild SET prefix=? WHERE id=?`, [prefix, message.guild.id]).then( ()=>{
        client.guildPrefixes.set(message.guild.id, prefix);
        const prefixDoneEmbed = new Discord.MessageEmbed()
        .setTitle("Prefix has been changed!")
        .setDescription(`new prefix is \`${prefix}\``)
        .setColor("#05c963")
        
        message.channel.send(prefixDoneEmbed);
    });
}

exports.config = {
    "name": "prefix",
    "enabled": true,
    "adminCmd": true
}

exports.help = {
    description: "Changes the prefix in the server to something else. The prefix cannot contain spaces and it cannot be longer than 5 characters.",
    usage: ["prefix <new prefix>"],
    usageHelp : ["without the <>"]
}

