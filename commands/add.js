const Discord=require("discord.js");
const db=require("../database/db.js");
const client=require("../variables/client.js")
const asleep=require("asleep")
const setupFilter=require("../filters/setupFilter.js");
const fetchMessages = require("../scripts/fetchMessages.js");
client.channelAddings= new Map();

exports.run = async(message, args) =>{
    if(args.length!=1 || !message.mentions.channels.first()){
        return client.commands.get("help").run(message, ["add"]);
    }

    const mentionedChannel=message.mentions.channels.first();
    if(!mentionedChannel.viewable) return message.channel.send("I can't access the channel");
    let channel=mentionedChannel;

    const time=Date.now()-client.channelAddings.get(message.guild.id);
    if(!time || time>3600000){
        message.channel.send("500 new messages will added shortly")
        client.channelAddings.set(message.guild.id, Date.now())
        
        if(client.fetchingQueue.length>0){
            client.fetchingQueue.push(function(){addMessages(channel)})
            console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);
        }
        else{
            client.fetchingQueue.push(function(){addMessages(channel)}) 
            console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);        
            await addMessages(channel)
        }
    }
    else{
        let remainingTime=Math.round((3600000-time)/60000);
        
        message.channel.send(`This command can only be used every 60 minutes, you need to wait ${remainingTime} more minutes`)
    }


    async function addMessages(channel){
        let messages = [];
        let lastID;
        let rows=await db.query(`SELECT last_id FROM channel WHERE id='${channel.id}'`).then(rows =>{return rows});
        if(rows.length>0){
            lastID=rows[0]["last_id"];
        }
        //console.log(lastID)
        
        fetchMessages(mentionedChannel, 500, lastID).then(async result =>{
            messages = result.messages;
            lastID=result.lastID;

            messages = await setupFilter(messages);
            messages = messages.reverse();
            for(message of messages){
                db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp])     
            }
            if(await db.query(`SELECT * FROM channel WHERE id='${channel.id}'`).then(rows =>{return rows}));
            if(rows.length===0){
                await db.query(`INSERT INTO channel VALUES('${channel.id}','${channel.guild.id}','${lastID}', 1)`)
            }
            else{
                await db.query(`UPDATE channel SET last_id='${lastID}' WHERE id='${channel.id}'`)
            }     
        }).catch( () =>{
            //
        }).finally( async () =>{
            client.fetchingQueue.splice(0, 1)           
            if(client.fetchingQueue[0]) {
                client.fetchingQueue[0]()
            }
            console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);
        })                  
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