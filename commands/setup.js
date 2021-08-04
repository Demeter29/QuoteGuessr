const client = require("../constants/client");
const db=require("../database/db.js");
const Discord=require("discord.js")
const setupFilter=require("../filters/setupFilter.js");
const downloadString="We are caching messages right now. This should take 1-3 minutes, you don't have to do anything else just wait. \n\n **Downloading Status**";
const fetchMessages = require("../scripts/fetchMessages.js");

client.fetchingQueue=[];
exports.run = async (message, args) =>{
    const prefix=client.guildPrefixes.get(message.guild.id);
    if(args.length===0){
        
        const setupEmbed=new Discord.MessageEmbed()
        .setTitle("Setup")
        .setDescription("Before playing the game, you need to load the messages from a channel. \n\n Mention a channel from which the messages will be used (you can add other channels later on). \n`"+prefix+"setup <#channel>`  \n\n Please note that this requires us to save the messages locally which we keep secure and will get completely earesed when the bot leaves the server or you use the "+prefix+"remove command.")
        .setColor("#05c963");

        message.channel.send(setupEmbed); 
    }
    else if(args.length===1){
        if(!message.mentions.channels.first()){
            const noMentionEmbed = new Discord.MessageEmbed()
            .setTitle("Error: Mention a channel with the command")
            .setDescription(`Example: \`${prefix}setup #general\``)
            .setColor("#ff0830");

            return message.channel.send(noMentionEmbed);
        }
        const mentionedChannel=message.mentions.channels.first();
        if(!mentionedChannel.viewable){
            const cantAccessEmbed=new Discord.MessageEmbed()
            .setTitle("I can't access the channel")
            .setDescription("I don't have permission to view that channel.")
            .setColor("#ff0830");

            return message.channel.send(cantAccessEmbed);
        }

        for(item of client.fetchingQueue){
            if(item.channel.guild.id==message.guild.id){
                
                return message.channel.send("you are in setup right now, please wait!");
            }
        }

        download(mentionedChannel);           
    }
   

    async function download(mentionedChannel){
        if(await db.query(`SELECT is_setup FROM guild WHERE id='${message.guild.id}'`).then(results =>{return results[0]["is_setup"]})){
            
            const alreadySetUpEmbed = new Discord.MessageEmbed()
            .setTitle("This server is already set up!")
            .setDescription(`you can start playing by using \`${prefix}play\` or you can add new channels by using the \`${prefix}add\` command.`)
            .setColor("#ff0830");

            return message.channel.send(alreadySetUpEmbed);
        }

        const downloadEmbed=new Discord.MessageEmbed()
        .setTitle("Fetching messages.. please wait...")
        .setDescription(downloadString)
        .setColor("#05c963");

        let downloadMessage=await message.channel.send(downloadEmbed);

        if(client.fetchingQueue.length>0){
            downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 2 minutes");
            downloadMessage.edit(downloadEmbed);
            client.fetchingQueue.push({
                "channel": mentionedChannel,
                "run": function(){getAllMessages(mentionedChannel)}    
            })
            console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);
        }
        else{
            client.fetchingQueue.push({
                "channel": mentionedChannel,
                "run": function(){getAllMessages(mentionedChannel)}    
            })
            console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);        
            await getAllMessages(mentionedChannel);
        }
        

        async function getAllMessages(mentionedChannel){
            downloadEmbed.setDescription(downloadString+"\n Estimated remaining time: 60 seconds");
            downloadMessage.edit(downloadEmbed);

            let messages = [];
            fetchMessages(mentionedChannel, 5000).then( async result =>{
                messages = result.messages;
                lastID = result.lastID;

                downloadEmbed.setDescription(downloadString+"\n Finished!");
                downloadMessage.edit(downloadEmbed);
                const finishedEmbed=new Discord.MessageEmbed()
                .setTitle("Setup finished!")
                .setDescription("Everything is done, now you can start playing!")
                .setColor("#05c963");
                
                message.channel.send(finishedEmbed);

                messages=await setupFilter(messages);
                messages = messages.reverse();
                for(message of messages){
                    db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp]);
                    
                } 
                db.query(`UPDATE guild set is_setup=true WHERE guild.id='${message.guild.id}'`);
                db.query(`INSERT INTO channel VALUES('${mentionedChannel.id}','${mentionedChannel.guild.id}')`);
                client.trackedChannels.push(mentionedChannel.id);
            }).catch( () =>{
                const errorEmbed = new Discord.MessageEmbed()
                .setTitle("Error")
                .setDescription(`Sorry but we couldn't set up the server! Try again in a few minutes or join our [support server](${client.config.supportServerLink}) for help `)
                .setColor("#ff0830");

                message.channel.send(errorEmbed);
            }).finally( async () =>{
                client.fetchingQueue.splice(0, 1);
                if(client.fetchingQueue[0]) {
                    client.fetchingQueue[0].run();
                }
                console.log(`fetch queue: ${await client.shard.fetchClientValues("fetchingQueue.length")}`);
            })                                       
        }
    }   
};

exports.help = {
    description: "When you add the bot to a server, first you need to set it up with this command, it will load messages from the channel you mention. The process will take a few minutes.",
    usage: ["setup", "setup #channel"],
    usageHelp : ["explains the setup process", "starts the setup with the mentioned channel"]
};

exports.config = {
    name: "setup",
    enabled: true,
    adminCmd: true
};

