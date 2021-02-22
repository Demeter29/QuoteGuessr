const client=require("../variables/client.js");
const db=require("../database/db.js")

module.exports = async() => {
    console.log("ready")
    client.user.setActivity(`${client.config.prefix}help`, {type: "WATCHING"});

    for await(guild of client.guilds.cache){
      let guildID=guild[0]
      const rows=await db.query(`SELECT id FROM guild WHERE id=${guildID}`).then(rows=>{return rows});

      if(rows.length===0){   
        await db.query(`INSERT INTO guild VALUES('${guildID}', '${client.config.defaultPrefix}', 0)`); 
      }
    }
    
    const guilds=await db.query(`SELECT id,prefix FROM guild`).then(rows =>{ return rows});
    
    client.guildPrefixes= new Map();  
    for(guild of guilds){
      client.guildPrefixes.set(guild["id"], guild["prefix"]);

    }
    
  };