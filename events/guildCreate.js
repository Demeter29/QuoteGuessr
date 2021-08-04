const db=require("../database/db.js");
const client=require("../constants/client.js");

module.exports = async (guild)=>{
    await db.query(`INSERT INTO guild VALUES('${guild.id}', '${client.config.defaultPrefix}', 0)`);

    client.guildPrefixes.set(guild["id"], client.config.defaultPrefix);


}