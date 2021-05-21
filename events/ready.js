const client=require("../variables/client.js");
const db=require("../database/db.js");

module.exports = async() => {

  const guildsInCache= client.guilds.cache.map(guild => guild.id);
  const guildsInDB=await db.query(`SELECT id,prefix FROM guild;`).then(rows =>{ return rows});

  //make sure every guild is in the database
  for await(guildID of guildsInCache){
    const rows=await db.query(`SELECT id FROM guild WHERE id=${guildID};`).then(rows=>{return rows});

    if(rows.length===0){   
      await db.query(`INSERT INTO guild VALUES('${guildID}', '${client.config.defaultPrefix}', 0);`); 
    }
  }

  //make sure every guild in the database is still valid(the bot is still in the guild) and also load their prefixes into memory
  client.guildPrefixes= new Map(); 
  for await(guild of guildsInDB){
    if(guildsInCache.includes(guild.id)){
      client.guildPrefixes.set(guild.id, guild.prefix);
    }
    else{
      db.query(`DELETE FROM guild WHERE id=${guild.id};`)
      db.query(`DELETE FROM message WHERE guild_id = ${guild.id}`)
    }
  }

  client.trackedChannels = new Array();
  const rows = await db.query(`SELECT id FROM channel WHERE is_tracked=true;`).then( rows =>{return rows});
  for(row of rows){
    client.trackedChannels.push(row["id"]);
  }

  client.user.setActivity(`${client.config.defaultPrefix}help`, {type: "WATCHING"});
  console.log(client.user.username+" is ready")
};