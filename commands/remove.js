const Discord=require("discord.js");
const db=require("../database/db.js");
const client=require("../constants/client.js");

exports.run= async (message, args) =>{
    let channel;
    if(args.length!=1 || !message.mentions.channels.first() || message.mentions.channels.first().type!="text"){
        return client.commands.get("help").run(message, ["remove"]);
    }
    else{
        const channelMention=message.mentions.channels.first();
        if(!channelMention.viewable){
            const cantAccessEmbed=new Discord.MessageEmbed()
            .setTitle("I can't access the channel")
            .setDescription("I don't have permission to view that channel.")
            .setColor("#ff0830");

            return message.channel.send(cantAccessEmbed);
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

    const removeEmbed = new Discord.MessageEmbed()
    .setTitle("Channel has been removed from the game!")
    .setColor("#05c963");

    message.channel.send(removeEmbed);
}

exports.config = {
    name:"remove",
    adminCmd: true
};

exports.help = {
    description: "Removes the channel and its messages from the game.",
    usage: ["remove #channel"],
    usageHelp : [""]
};