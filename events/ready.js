const client=require("../constants/client.js");
const db=require("../database/db.js");

module.exports = async() => {

  const guildsInCache = client.guilds.cache.values();
  client.guildPrefixes= new Map(); 
  for await (guild of guildsInCache){
    await db.query(`SELECT * FROM guild WHERE id='${guild.id}';`)
    .then(async (rows) => {
      if(rows.length==0){
        await db.query(`INSERT INTO guild VALUES('${guild.id}', '${client.config.defaultPrefix}', 0);`); 
        client.guildPrefixes.set(guild.id, client.config.defaultPrefix);
      }
      else{
        const prefix = await db.query(`SELECT prefix FROM guild WHERE id='${guild.id}';`).then(rows =>{return rows[0]["prefix"]});
        client.guildPrefixes.set(guild.id, prefix);
      }
    });
  }

  //channels
  client.trackedChannels = new Array();
  const channelsInCache = client.channels.cache.values();
  for await(channel of channelsInCache){
    await db.query(`SELECT id FROM channel WHERE id='${channel.id}';`)
    .then(rows =>{
      if(rows.length){
        client.trackedChannels.push(rows[0]["id"]);
      }
    })
  }

  client.user.setActivity(`${client.config.defaultPrefix}help`, {type: "WATCHING"});
};