const client=require("../variables/client.js");
const db=require("../database/db.js");


exports.run = async (message, args) =>{
    if(!(args.length===1)) return message.reply("prefix cannot contain spaces!");
    if(args[0].length>5) return message.reply("prefix length cannot be longer than 5 characters!");
    const prefix=args[0].toLowerCase()

    db.query(`UPDATE guild SET prefix=? WHERE id=?`, [prefix, message.guild.id]).then( ()=>{
        client.guildPrefixes.set(message.guild.id, prefix);
        message.channel.send(`prefix has been changed to \`${prefix}\``)
    });
}

exports.config = {
    "name": "prefix",
    "enabled": true,
    "adminCmd": true
}

exports.help = {
    description: "changes the prefix in the guild",
    usage: "prefix <new prefix>",
    example: "prefix !"
}

