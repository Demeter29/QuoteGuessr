const client=require("../variables/client.js");
const db=require("../database/db.js");

module.exports = async() => {
    //make sure every guild is in the database
    
    //make sure every guild in the database is still valid
    const guildsInDB = await db.query(`SELECT id FROM guild;`).then(rows =>{ return rows});
    const fetchedGuilds = await client.shard.fetchClientValues("guilds.cache");
    let guildsInCache = new Array();
    for (shard of fetchedGuilds){
        for(guild of shard){
            guildsInCache.push(guild.id)
        }
    }

    for(guild of guildsInDB){
        if(!guildsInCache.includes(guild.id)){
            console.log(`deleted guild:${guild.id} from db`)
            db.query(`DELETE FROM guild WHERE id='${guild.id}';`);
            db.query(`DELETE FROM message WHERE guild_id = '${guild.id}';`);
            db.query(`DELETE FROM channel WHERE guild_id = '${guild.id}';`);
            db.query(`DELETE FROM user WHERE guild_id = '${guild.id}';`);
        }
    }

    console.log("Quote Guessr is ready");
};