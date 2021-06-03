const Discord=require("discord.js");
const db=require("../database/db.js");
const client=require("../variables/client.js")
const asleep=require("asleep")
const setupFilter=require("../filters/setupFilter.js")
client.channelAddings= new Map();

exports.run = async(message, args) =>{
    let channel;
    if(args.length!=1 || !message.mentions.channels.first()){
        return message.channel.send(client.guildPrefixes.get(message.guild.id)+"add <#channel>")
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

    const time=Date.now()-client.channelAddings.get(message.guild.id);
    if(!time || time>3600000){
        message.channel.send("500 new messages will added shortly")
        client.channelAddings.set(message.guild.id, Date.now())
        addMessages(channel);
    }
    else{
        let remainingTime=Math.round((3600000-time)/60000);
        
        message.channel.send(`This command can only be used every 60 minutes, you need to wait ${remainingTime} more minutes`)
    }







    async function addMessages(channel){
        let messages = [];
        let lastID;
        let rows=await db.query(`SELECT last_id FROM channel WHERE id='${channel.id}'`).then(rows =>{return rows});
        if(rows.length===0 || rows[0]["last_id"]==0){
            lastID=await channel.messages.fetch({limit: 1}).then(messages =>{return messages.entries().next().value[0]})
        }
        else{
            lastID=rows[0]["last_id"];
        }
        //console.log(lastID)
        let startTime=Date.now();
        
        while (true) { 
            const fetchedMessages = await channel.messages.fetch({
                limit: 100,
                ...(lastID && { before: lastID }),
            });
            if (fetchedMessages.size === 0 || messages.length>=500) {                   

                client.downloadQueue.splice(0, 1)           
                if(client.downloadQueue[0]) client.downloadQueue[0]();

                messages=await setupFilter(messages);
                messages = messages.reverse()
                for(message of messages){
                    //console.log(message.content)
                    db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp])
                    
                }
                if(await db.query(`SELECT * FROM channel WHERE id='${channel.id}'`).then(rows =>{return rows}));
                if(rows.length===0){
                    await db.query(`INSERT INTO channel VALUES('${channel.id}','${channel.guild.id}','${lastID}', 1)`)
                }
                else{
                    await db.query(`UPDATE channel SET last_id='${lastID}' WHERE id='${channel.id}'`)
                }
                
                
                return;
            }
            messages = messages.concat(Array.from(fetchedMessages.values()));

            lastID = fetchedMessages.lastKey();
            await asleep(1200);
                 
        }
    }
}

exports.config = {
    name:"add",
    adminCmd: true
}

exports.help = {
    description: "Add another 500 messages to the game from the channel you mention.",
    usage: ["add #channel"],
    usageHelp : [""]
}