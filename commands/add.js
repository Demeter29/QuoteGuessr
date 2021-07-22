const Discord=require("discord.js");
const db=require("../database/db.js");
const client=require("../constants/client.js")
const asleep=require("asleep")
const setupFilter=require("../filters/setupFilter.js");
const fetchMessages = require("../scripts/fetchMessages.js");
//client.channelAddings= new Map();  implement later? But maybe we dont need to, depends how much traffic will the bot have.

exports.run = async(message, args) =>{
    const prefix= client.guildPrefixes.get(message.guild.id);
    if(args.length!=1 || !message.mentions.channels.first() || message.mentions.channels.first().type!="text"){
        return client.commands.get("help").run(message, ["add"]);
    }

    const mentionedChannel=message.mentions.channels.first();
    if(!mentionedChannel.viewable) return message.channel.send("I can't access the channel");

    db.query(`SELECT id FROM channel WHERE id='${mentionedChannel.id}'`)
        .then(rows=>{
            if(rows.length>0){
                const alreadyAddedEmbed = new Discord.MessageEmbed()
                .setTitle("Error: This Channel is already added")
                .setDescription(`To check the already added channels, use the \`${prefix}guild\` command.`)
                .setColor("#ff0830")

                return message.channel.send(alreadyAddedEmbed)
            }
        });
   
        
    

    const addEmbed = new Discord.MessageEmbed()
    .setTitle(`#${mentionedChannel.name} will be added shortly`)
    .setDescription(`This might take some time. \n\n Tip: If you want to remove a channel from the game, use the \`${prefix}remove\` command.`)
    .setColor("#05c963")

    message.channel.send(addEmbed);
    
    if(client.fetchingQueue.length>0){
        client.fetchingQueue.push({
            "channel": mentionedChannel,
            "run": function(){addMessages(mentionedChannel)}
        })
        console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);
    }
    else{
        client.fetchingQueue.push({
            "channel": mentionedChannel,
            "run": function(){addMessages(mentionedChannel)}
        })
        console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);        
        await addMessages(mentionedChannel)
    }

    async function addMessages(channel){
        let messages = [];
        let lastID;
        
        fetchMessages(mentionedChannel, 500).then(async result =>{
            messages = result.messages;
            lastID=result.lastID;

            messages = await setupFilter(messages);
            messages = messages.reverse();
            for(message of messages){
                db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp])     
            }
            await db.query(`INSERT INTO channel VALUES('${channel.id}','${channel.guild.id}')`)
               
        }).catch( () =>{
            //
        }).finally( async () =>{
            client.fetchingQueue.splice(0, 1)           
            if(client.fetchingQueue[0]) {
                client.fetchingQueue[0].run()
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
    description: "Add a channel to game, first it will add 500 messages and also track every new message",
    usage: ["add #channel"],
    usageHelp : [""]
}