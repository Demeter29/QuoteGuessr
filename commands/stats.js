const Discord = require("discord.js");
const db = require("../database/db.js");

exports.run = async (message, args) =>{
    const statsEmbed=new Discord.MessageEmbed()
    .setAuthor(message.member.displayName)
    .setTitle("Guess the Author User Statistics")
    .addField("Single message games (won/played)", "`"+await getStat("single", "won")+"/"+await getStat("single", "played")+" ("+await getWinRate("single")+"%)`")
    .setThumbnail(message.author.displayAvatarURL())
    
    message.channel.send(statsEmbed);

    async function getStat(mode, type){
       let result= await db.query(`SELECT ${mode}_games_${type} AS result FROM user WHERE user_id=${message.author.id} AND guild_id=${message.guild.id}`).then( rows=>{return rows});

       if(result.length===0){
           return 0;
       }
       else{
           return result[0]["result"];
       }
    }
    async function getWinRate(mode){
        let played=await getStat("single", "played");
        let won=await getStat("single", "won");
        if(played===0){
            return 0;
        }
        else{
            return Math.round((won/played)*100)
        }
    }
    
}

exports.config = {
    name: "stats",
    enabled: true,
    adminCmd: false
}

exports.help = {
    description: "shows you your guild statistics",
    usage: "stats",
}
