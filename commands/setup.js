const client = require("../variables/client");
const asleep=require("asleep");
const db=require("../database/db.js");
const setupFilter=require("../filters/setupFilter.js")

const toDownload=[]
exports.run = async (message, args) =>{

    if(client.downloading){
        message.channel.send("other process is downloading, waiting...")
        toDownload.push(function(){getAllMessages(message.channel); toDownload.splice(0, 1)})
    }
    else{
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
                
                
                
                console.log("finished downloading")
                client.downloading=false;
                if(toDownload[0]) toDownload[0]();

                    messages=await setupFilter(messages);
                    messages = messages.reverse()
                    for(message of messages){
                        //console.log(message.content)
                        db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp])
                        
                    }   
                return;
            }
            messages = messages.concat(Array.from(fetchedMessages.values()));
            lastID = fetchedMessages.lastKey();
            console.log((Date.now()-startTime)/1000+": "+messages.length)
            await asleep(1200);
                 
        }
    }
}

exports.config = {
    name: "setup",
    enabled: true,
    adminCmd: true
}