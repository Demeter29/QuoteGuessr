const Discord = require("discord.js");
const client= require("../constants/client.js")
const db = require("../database/db.js");

exports.run = async (message, args) =>{
    console.log( await client.shard.fetchClientValues("guilds.cache"));
   
    
    
}

exports.config = {
    name: "test",
    enabled: true,
    adminCmd: false
}

exports.help = {
    description: "Shows you the statistics about you, how many points you have, how many games have you won, etc.",
    usage: ["stats"],
    usageHelp : [""]
}
