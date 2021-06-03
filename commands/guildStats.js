const Discord=require("discord.js");
const db=require("../database/db.js");

exports.run = async (message, args) =>{
    const guildStatsEmbed=new Discord.MessageEmbed()
    .setTitle("Guild Stats")
    .addField("Number of saved messages", "`"+await getNumberOfMessages()+"`")
    .addField("Number of valid authors", "`"+await getNumberOfAuthors()+"`")
    .addField("Tracked channels",await getNumberOfChannels())

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
        let results= await db.query(`SELECT count(*) AS number_of_authors FROM (SELECT count(*) AS message_count FROM message WHERE guild_id='${message.guild.id}' GROUP BY author_id HAVING message_count>100) AS author`).then(results =>{return results});

        if(!results.length){
            return 0;
        }
        else{
            return results[0]["number_of_authors"];
        }
    }

    async function getNumberOfChannels(){
        let results= await db.query(`SELECT COUNT(*) AS message_count, channel_id FROM message WHERE guild_id='${message.guild.id}' GROUP BY channel_id`).then(rows =>{return rows})

        if(!results.length) return "`-`";

        let channels="";
        for(row of results){
        channels+=message.guild.channels.resolve(row["channel_id"]).name+": "+row["message_count"] +"\n";
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