const Discord=require("discord.js");
const client=require("../variables/client.js");
const db=require("../database/db.js");

exports.run = async(message,args)=>{

    switch (args[0]){
        case "add":
            add();
            break;
        case "remove":
            remove();
            break;
        case "show":
            show();
            break;
        default:
            client.commands.get("help").run(message, ["track"])
            break;
    }

    async function add(){
        const channel=message.mentions.channels.first();
        if(!channel || !channel.viewable) return message.channel.send("The channel doesn't exist or I can't access it")

        const channelRow= await db.query(`SELECT * FROM channel WHERE id=${channel.id}`).then(rows =>{return rows});
        if(channelRow.length==0){
            db.query(`INSERT INTO channel VALUES(${channel.id}, ${message.channel.id}, 0, 1)`);
        }
        else{
            db.query(`UPDATE channel SET is_tracked=1 WHERE id=${channel.id}`);
        }

        message.channel.send("The channel is now tracked!")
    }

    async function remove(){
        const channel=message.mentions.channels.first();
        if(!channel || !channel.viewable) return message.channel.send("The channel doesn't exist or I can't access it")

        const channelRow= await db.query(`SELECT * FROM channel WHERE id=${channel.id}`).then(rows =>{return rows});
        if(channelRow.length==0){
            return message.channel.send("the channel is not tracked!")
        }
        else{
            db.query(`DELETE FROM channel WHERE id=${channel.id}`);
            message.channel.send("channel is now not tracked")
        }

    }

    async function show(){
        const rows=await db.query(`SELECT id FROM channel WHERE is_tracked=1 AND guild_id=${message.guild.id}`).then( rows=>{return rows});
        let output="```\r\n";
        for(row of rows){
            output+=message.guild.channels.resolve(row["id"]).name+"\r\n";
        }
        output+="```"
        const showEmbed=new Discord.MessageEmbed()
        .setTitle("Tracked Channels")
        .setDescription(output)

        message.channel.send(showEmbed)
    }
}

exports.config= {
    name:"track",
    adminCmd:true
}

exports.help={
    description: "When you track a channel all messages sent in there will be automatically stored for the game, you can untrack a channel anytime and you can remove the messages with the remove command anytime.",
    usage: [
        "track add #channel",
        "track remove #channel",
        "track show"
    ],
    usageHelp: [
        "add a channel to track",
        "removes a channel from the tracked channels to no longer track",
        "shows you the currently tracked channels"
    ]
}