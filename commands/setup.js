const client = require("../variables/client");
const asleep=require("asleep");
const db=require("../database/db.js");
const Discord=require("discord.js")
const setupFilter=require("../filters/setupFilter.js");
const { DiscordAPIError } = require("discord.js");
const downloadString="Beacuse Discord limits the speed we can cache messages we have to do it slowly which takes 1-3 minutes, you don't have to do anything else just wait. \n\n **Downloading Status**";

const toDownload=[]
exports.run = async (message, args) =>{
    const prefix=client.guildPrefixes.get(message.guild.id);
    if(args.length===0){
        
        const setupEmbed=new Discord.MessageEmbed()
        .setTitle("SETUP")
        .setDescription("Welcome, Guess the author is a game where you will see a random message from the server and have to guess who was the brilliant author \n\n choose a channel from which the messages will be used, (you can add other channels later on) \n`"+prefix+"setup <#channel>`  \n")

        message.channel.send(setupEmbed); 
    }
    else if(args.length===1 && message.mentions.channels.first()){
        const channel=message.mentions.channels.first();
        //console.log(channel.permissionOverwrites)
        if(!channel.viewable){
            return message.channel.send("I can't access the channel");
        }

        const setupEmbed2=new Discord.MessageEmbed()
        .setTitle("SETUP")
        .setDescription("In order for the game to work we need to save the messages from the channel you assigned, the stored information includes the message author and message content \n \n By continuing the setup you agree to let us save these data which are only going to be used for the game and will be deleted once the bot leaves the server or you use the "+prefix+"destroy command \n\n To continue the setup: \n `"+prefix+"setup start`")

        message.channel.send(setupEmbed2)

        const filter= m => (m.author.id===message.author.id && m.content.substring(prefix.length)==="setup start")
        message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
		.then(collected => {
			download();
		})
		.catch(error => {
            console.log(error)
			message.channel.send('no reply in 60 seconds, operation cancelled. You need to use the command again!');
		});
    }
   

    async function download(){
        if(await db.query(`SELECT is_setup FROM guild WHERE id=${message.guild.id}`).then(results =>{return results[0]["is_setup"]})){
            message.channel.send("this server is already set up!")
            return;
        }


        const downloadEmbed=new Discord.MessageEmbed()
        .setTitle("Downloading...")
        .setDescription(downloadString)

        let downloadMessage=await message.channel.send(downloadEmbed)

        
        
        


        if(client.downloading){
            downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 2 minutes")
            downloadMessage.edit(downloadEmbed)
            toDownload.push(function(){getAllMessages(message.channel); toDownload.splice(0, 1)})
        }
        else{
            downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 60 seconds")
            downloadMessage.edit(downloadEmbed)
            getAllMessages(message.mentions.channels.first()) //message.guild.channels.resolve("729367696667443300")
        }
    
        async function getAllMessages(channel){
            client.downloading=true;
            let messages = [];
            let lastID;
    
            let startTime=Date.now();
            
            while (true) { 
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

                    client.downloading=false;
                                    
                    if(toDownload[0]) toDownload[0]();
    
                        messages=await setupFilter(messages);
                        messages = messages.reverse()
                        for(message of messages){
                            //console.log(message.content)
                            db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp])
                            
                        } 
                        db.query(`UPDATE guild set is_setup=true WHERE guild.id=${message.guild.id}`) 
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
        }
    }
    
}

exports.config = {
    name: "setup",
    enabled: true,
    adminCmd: true
}