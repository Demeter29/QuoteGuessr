const client = require("../variables/client");
const asleep=require("asleep");
const db=require("../database/db.js");
const Discord=require("discord.js")
const setupFilter=require("../filters/setupFilter.js");
const { DiscordAPIError } = require("discord.js");
const downloadString="We are caching messages right now. This should take 1-3 minutes, you don't have to do anything else just wait. \n\n **Downloading Status**";
const fetchMessages = require("../scripts/fetchMessages.js");

client.fetchingQueue=[];
exports.run = async (message, args) =>{
    const prefix=client.guildPrefixes.get(message.guild.id);
    if(args.length===0){
        
        const setupEmbed=new Discord.MessageEmbed()
        .setTitle("Setup")
        .setDescription("Welcome, Guess the author is a game where you will see a random message from the server and have to guess who was the brilliant author. \n\n Mention a channel from which the messages will be used (you can add other channels later on). \n`"+prefix+"setup <#channel>`  \n\n Please note that this requires us to save the messages locally which we keep secure and they get completely earesed when the bot leaves the server or you use the "+prefix+"remove command.")

        message.channel.send(setupEmbed); 
    }
    else if(args.length===1 && message.mentions.channels.first()){
        const channel=message.mentions.channels.first();
        //console.log(channel.permissionOverwrites)
        if(!channel.viewable){
            return message.channel.send("I can't access the channel");
        }

        download(channel)
        
        
    }
   

    async function download(channel){
        if(await db.query(`SELECT is_setup FROM guild WHERE id='${message.guild.id}'`).then(results =>{return results[0]["is_setup"]})){
            message.channel.send("this server is already set up!")
            return;
        }

        const downloadEmbed=new Discord.MessageEmbed()
        .setTitle("Fetching messages.. please wait...")
        .setDescription(downloadString);

        let downloadMessage=await message.channel.send(downloadEmbed);

        
        if(client.fetchingQueue.length>0){
            downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 2 minutes")
            downloadMessage.edit(downloadEmbed)
            client.fetchingQueue.push(function(){getAllMessages(channel)})
            console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);
        }
        else{
            client.fetchingQueue.push(function(){getAllMessages(channel)}) 
            console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);        
            await getAllMessages(channel)
        }
        
    
        async function getAllMessages(channel){
            downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 60 seconds")
            downloadMessage.edit(downloadEmbed)
            
            //client.downloading=true;
            let messages = [];
            let lastID;

            fetchMessages(message.channel, 5000).then( async result =>{
                messages = result.messages;
                lastID = result.lastID;

                downloadEmbed.setDescription(downloadString+"\n Finished!");
                downloadMessage.edit(downloadEmbed)
                const finishedEmbed=new Discord.MessageEmbed()
                .setTitle("Setup finished!")
                .setDescription("Everything is done, now you can start playing!")
                message.channel.send(finishedEmbed)

                
                messages=await setupFilter(messages);
                messages = messages.reverse();
                for(message of messages){
                    db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp])
                    
                } 
                db.query(`UPDATE guild set is_setup=true WHERE guild.id='${message.guild.id}'`)
                db.query(`INSERT INTO channel VALUES('${channel.id}','${channel.guild.id}','${lastID}', 1)`)
                client.trackedChannels.push(channel.id);
            }).catch( () =>{
                const errorEmbed = new Discord.MessageEmbed()
                .setTitle("Error")
                .setDescription(`Sorry but we couldn't set up the server! Try again in a few minutes or join our [support server](${client.config.supportServerLink}) for help `)
                .setColor("#ff0830")

                message.channel.send(errorEmbed);
                
            }).finally( async () =>{
                client.fetchingQueue.splice(0, 1)           
                if(client.fetchingQueue[0]) {
                    client.fetchingQueue[0]()
                }
                console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);
            })
                                             
        }
    }
    
}

exports.help = {
    description: "When you add the bot to a server first you need to set it up with this command, it will load messages from the channel you mention. The process takes a few minutes.",
    usage: ["setup"],
    usageHelp : [""]
}

exports.config = {
    name: "setup",
    enabled: true,
    adminCmd: true
}

