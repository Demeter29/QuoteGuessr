const client=require("../variables/client.js");
const db=require("../database/db.js")

module.exports = async() => {
    console.log("ready")
    client.user.setActivity(`${client.config.prefix}help`, {type: "WATCHING"});

    const guilds=await db.query(`SELECT id,prefix FROM guild`).then(rows =>{ return rows});
    
    client.guildPrefixes= new Map();  
    for(guild of guilds){
      client.guildPrefixes.set(guild["id"], guild["prefix"]);

    }

    
  };