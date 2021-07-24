const Discord=require("discord.js");
const db=require("../database/db.js");
const client=require("../constants/client.js")
const asleep=require("asleep")
const setupFilter=require("../filters/setupFilter.js");
const fetchMessages = require("../scripts/fetchMessages.js");
const amountOfRecentlyAddedChannels= new Map();
                            
exports.run = async (message, args) => {
    const prefix= client.guildPrefixes.get(message.guild.id);
    if(args.length!=1 || !message.mentions.channels.first() || message.mentions.channels.first().type!="text"){
        return client.commands.get("help").run(message, ["add"]);
    }

    const mentionedChannel=message.mentions.channels.first();
    if(!mentionedChannel.viewable) return message.channel.send("I can't access the channel");

    let rows = await db.query(`SELECT id FROM channel WHERE id='${mentionedChannel.id}'`).then(rows=>{return rows});
    
    if(rows.length>0){
        const alreadyAddedEmbed = new Discord.MessageEmbed()
        .setTitle("Error: This Channel is already added")
        .setDescription(`To check the already added channels, use the \`${prefix}guild\` command.`)
        .setColor("#ff0830")

        return message.channel.send(alreadyAddedEmbed);
    }
    else{
        for (fetching of client.fetchingQueue){
            if(mentionedChannel.id==fetching.channel.id){
                const alreadyFetchingEmbed = new Discord.MessageEmbed()
                .setTitle("Error: This Channel is already being added")
                .setDescription(`This channel is already in the queue, please wait.`)
                .setColor("#ff0830")

                return message.channel.send(alreadyFetchingEmbed);
            }
        }
    }
           
    if(amountOfRecentlyAddedChannels.get(mentionedChannel.guild.id)>=3){
        const tooMuchAddingEmbed = new Discord.MessageEmbed()
            .setTitle("Error: You are adding channels too fast!")
            .setDescription(`Please wait a few minutes before adding more.`)
            .setColor("#ff0830")

            return message.channel.send(tooMuchAddingEmbed);
    }

    if(amountOfRecentlyAddedChannels.has(mentionedChannel.guild.id)){
        let amount = amountOfRecentlyAddedChannels.get(mentionedChannel.guild.id);
        amountOfRecentlyAddedChannels.set(mentionedChannel.guild.id, amount+1);
    }
    else{
        amountOfRecentlyAddedChannels.set(mentionedChannel.guild.id, 1); 
    }
    setTimeout(function(){
        let amount = amountOfRecentlyAddedChannels.get(mentionedChannel.guild.id); 
        amountOfRecentlyAddedChannels.set(mentionedChannel.guild.id, amount-1); 
    }, 900000); //15 minutes

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
        
        fetchMessages(mentionedChannel, 500).then(async result =>{
            messages = result.messages;
            lastID=result.lastID;

            messages = await setupFilter(messages);
            messages = messages.reverse();
            for(message of messages){
                db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp])     
            }
            await db.query(`INSERT INTO channel VALUES('${channel.id}','${channel.guild.id}')`)
               
        }).catch( (err) =>{
            console.log("ADD ERROR: "+err)
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