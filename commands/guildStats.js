const Discord=require("discord.js");
const db=require("../database/db.js");
const client = require("../constants/client.js")
const singleMessageFilter = require("../filters/singleMessageFilter.js")

exports.run = async (message, args) =>{
    const guildStatsEmbed=new Discord.MessageEmbed()
    .setTitle("Guild Stats")
    .addField("Number of total messages", "`"+await getNumberOfMessages()+"`")
    .addField("Number of valid authors", "`"+await getNumberOfAuthors()+"`")
    .addField("Number of messages from channels",await getChannels())
    .setColor("#05c963")

    message.channel.send(guildStatsEmbed);

    async function getNumberOfMessages(){
       let results= await db.query(`SELECT count(*) AS result FROM message GROUP BY guild_id HAVING guild_id='${message.guild.id}'`).then(rows =>{return rows})

       if(!results.length){
           return 0;
       }
       else{
           return results[0]["result"];
       }
    }

    async function getNumberOfAuthors(){
        let users = await db.query(`SELECT author_id, count(*) AS message_count FROM message WHERE guild_id='${message.guild.id}' GROUP BY author_id, guild_id`).then(rows => {return rows});
        for(let i = users.length - 1; i >= 0; i--) {
            let msgs = await db.query(`SELECT content, author_id, channel_id, time FROM message WHERE author_id='${users[i]["author_id"]}' AND guild_id='${message.guild.id}'`).then(rows => {return rows});
            msgs = singleMessageFilter(msgs, message.guild);
            if((msgs < client.config.minimalAmountOfMessages) || ( message.guild.members.resolve(users[i]["author_id"]) == null) || (message.guild.members.resolve(users[i]["author_id"]).user.bot)) {
                users.splice(i, 1);
            }
        }
        
        return users.length;
    }

    async function getChannels(){
        let results= await db.query(`SELECT COUNT(*) AS message_count, channel_id FROM message WHERE guild_id='${message.guild.id}' GROUP BY channel_id`).then(rows =>{return rows})

        if(!results.length) return "`-`";

        let channels="";
        for(row of results){
        channels+="#"+message.guild.channels.resolve(row["channel_id"]).name+": "+row["message_count"] +"\n";
        }
        return "`"+channels+"`";
     
    }
}

exports.config = {
    name:"guild",
    adminCmd:false
}

exports.help = {
    description: "Shows you statistics about the guild (server) where you are using the command.",
    usage: ["guild"],
    usageHelp : [""]
}