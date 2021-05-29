const Discord=require("discord.js");
const db=require("../database/db.js");
const client=require("../variables/client.js")

exports.run= async (message, args) =>{
    let channel;
    if(args.length!=1 || !message.mentions.channels.first()){
        return message.channel.send(client.guildPrefixes.get(message.guild.id)+"remove <#channel>")
    }
    else{
        const channelMention=message.mentions.channels.first();
        //console.log(channel.permissionOverwrites)
        if(!channelMention.viewable){
            return message.channel.send("I can't access the channel");
        }
        else{
            channel=channelMention;
        }
    }

    let channelName=channel.name;
    await db.query(`DELETE FROM channel WHERE id=${channel.id}`);
    await db.query(`DELETE FROM message WHERE channel_id=${channel.id}`);

    message.channel.send(channelName+" has been removed from the database")
}

exports.config = {
    name:"remove",
    adminCmd: true
}

exports.help = {
    description: "Removes the channel and its messages from the game.",
    usage: ["remove #channel"],
    usageHelp : [""]
}