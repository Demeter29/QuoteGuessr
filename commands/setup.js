const client = require("../variables/client");
const asleep=require("asleep");
const db=require("../database/db.js");
const Discord=require("discord.js")
const setupFilter=require("../filters/setupFilter.js");
const { DiscordAPIError } = require("discord.js");
const downloadString="We are caching messages right now this should take 1-3 minutes, you don't have to do anything else just wait. \n\n **Downloading Status**";

client.downloadQueue=[]
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

        if(client.downloadQueue.length>0){
            downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 2 minutes")
            downloadMessage.edit(downloadEmbed)
            client.downloadQueue.push(function(){getAllMessages(channel)})
        }
        else{
            client.downloadQueue.push(function(){getAllMessages(channel)})
            
            
            await getAllMessages(channel) //message.guild.channels.resolve("729367696667443300")
            
            
        }
    
        async function getAllMessages(channel){
            downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 60 seconds")
            downloadMessage.edit(downloadEmbed)
            
            //client.downloading=true;
            let messages = [];
            let lastID;
    
            let startTime=Date.now();
            
            while (true) { 
                try{
                    const fetchedMessages = await channel.messages.fetch({
                        limit: 100,
                        ...(lastID && { before: lastID }),
                    });
                    
                    if (fetchedMessages.size === 0 || messages.length>=5000) {                   
                        downloadEmbed.setDescription(downloadString+"\n Finished!");
                        downloadMessage.edit(downloadEmbed)
                        const finishedEmbed=new Discord.MessageEmbed()
                        .setTitle("Setup finished!")
                        .setDescription("Everything is done, now you can start playing!")
                        message.channel.send(finishedEmbed)

                        //client.downloading=false;
                        client.downloadQueue.splice(0, 1)           
                        if(client.downloadQueue[0]) client.downloadQueue[0]();
        
                        messages=await setupFilter(messages);
                        messages = messages.reverse()
                        for(message of messages){
                            //console.log(message.content)
                            db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp])
                            
                        } 
                        db.query(`UPDATE guild set is_setup=true WHERE guild.id='${message.guild.id}'`)
                        db.query(`INSERT INTO channel VALUES('${channel.id}','${channel.guild.id}','${lastID}', 1)`)
                        client.trackedChannels.push(channel.id);
                        
                        return;
                    }
                    messages = messages.concat(Array.from(fetchedMessages.values()));
                    if(messages.length===2000){
                        downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 30 seconds");
                        downloadMessage.edit(downloadEmbed)
                    }
                    else if(messages.length===4000){
                        downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 15 seconds");
                        downloadMessage.edit(downloadEmbed)
                    }
                    lastID = fetchedMessages.lastKey();
                    console.log((Date.now()-startTime)/1000+": "+messages.length)
                    await asleep(1200);
                }
                catch(error){
                    const errorEmbed = new Discord.MessageEmbed()
                    .setTitle("Error")
                    .setDescription(`Sorry but we couldn't set up the server! Try again in a few minutes or join our [support server](${client.config.supportServerLink}) for help `)
                    .setColor("#ff0830")

                    message.channel.send(errorEmbed);
                    client.downloadQueue.splice(0, 1)           
                    if(client.downloadQueue[0]) client.downloadQueue[0]();

                    return;
                }
                     
            }
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

