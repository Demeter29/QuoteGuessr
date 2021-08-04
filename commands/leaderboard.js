const Discord = require("discord.js");
const client=require("../constants/client.js");
const db=require("../database/db.js");
const { DiscordAPIError } = require("discord.js");

exports.run = async (message, args) =>{
    let highestWinstreakOrdered = await db.query(`SELECT user_id, highest_winstreak FROM user WHERE guild_id = '${message.guild.id}' ORDER BY highest_winstreak DESC`).then(rows =>{return rows});
    let highestPointsOrdered = await db.query(`SELECT user_id, points FROM user WHERE guild_id = '${message.guild.id}' ORDER BY points DESC`).then(rows =>{return rows});

    let highestWinstreakString = "`";
    let highestPointsString = "`";
    for(let i=0;i<20;i++){
        let rowWinstreak=highestWinstreakOrdered[i];
        let rowPoints=highestPointsOrdered[i];
        if(!rowWinstreak) continue;

        highestWinstreakString+=`#${i+1} ${message.guild.members.resolve(rowWinstreak["user_id"]).displayName}: ${rowWinstreak["highest_winstreak"]}\n`;
        highestPointsString+=`#${i+1} ${message.guild.members.resolve(rowPoints["user_id"]).displayName}: ${rowPoints["points"]}\n`;
    }
    highestWinstreakString+="`";
    highestPointsString+="`";

    const leaderboardEmbed = new Discord.MessageEmbed()
    .setTitle("Leaderboard")
    .addField("Highest Winstreaks:", highestWinstreakString, true)
    .addField("Highest Points:", highestPointsString, true)
    .setColor("#05c963");

    message.channel.send(leaderboardEmbed);
}

exports.config = {
    name: "leaderboard",
    adminCmd: false,
};

exports.help = {
    description: "shows you the players who have the highest winstreak and points on the server.",
    usage: ["leaderboard"],
    usageHelp : [""]
};