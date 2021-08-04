//this event emits when all the shards are loaded in (it emits only once).
const client=require("../constants/client.js");
const db=require("../database/db.js");

module.exports = async() => {
    //make sure every guild in the database is still valid
    const fetchedGuilds = await client.shard.fetchClientValues("guilds.cache");

    let guildsInCache = new Array();
    for (shard of fetchedGuilds){
        for(guild of shard){
            guildsInCache.push(guild.id);
        }
    }

    const guildsInDB = await db.query(`SELECT id FROM guild;`).then(rows =>{ return rows});

    for(guild of guildsInDB){
        if(!guildsInCache.includes(guild.id)){
            console.log(`deleted guild:${guild.id} from db`);
            db.query(`DELETE FROM guild WHERE id='${guild.id}';`);
            db.query(`DELETE FROM message WHERE guild_id = '${guild.id}';`);
            db.query(`DELETE FROM channel WHERE guild_id = '${guild.id}';`);
            db.query(`DELETE FROM user WHERE guild_id = '${guild.id}';`);
        }
    }

    //make sure every channel in the database is still valid
    const fetchedChannels = await client.shard.fetchClientValues("channels.cache");
    
    let channelsInCache = new Array();
    for(shard of fetchedChannels){
        for(channel of shard){
            channelsInCache.push(channel.id);
        }
    }

    const channelsInDB = await db.query(`SELECT id FROM channel;`).then(rows =>{ return rows});

    for(channel of channelsInDB){
        if(!channelsInCache.includes(channel.id)){
            console.log(`deleted channel:${guild.id} from db`);
            db.query(`DELETE FROM channel WHERE id = '${channel.id}';`);
            db.query(`DELETE FROM message WHERE channel_id = '${channel.id}';`);
        }
    }

    console.log("Quote Guessr is ready");
};