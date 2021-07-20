const Discord=require("discord.js");
const db=require("../database/db.js");
const client=require("../constants/client.js")

exports.run= async (message, args) =>{
    let channel;
    if(args.length!=1 || !message.mentions.channels.first() || message.mentions.channels.first().type!="text"){
        return client.commands.get("help").run(message, ["remove"]);
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

    await db.query(`DELETE FROM channel WHERE id='${channel.id}'`);
    await db.query(`DELETE FROM message WHERE channel_id='${channel.id}'`);

    if(client.trackedChannels.includes(channel.id)){
        var index = client.trackedChannels.indexOf(channel.id);
        client.trackedChannels.splice(index, 1);      
    }

    message.channel.send(channel.name+" has been removed from the database")
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