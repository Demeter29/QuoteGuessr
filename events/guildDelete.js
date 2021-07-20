const client=require("../constants/client.js");
const db=require("../database/db.js");

module.exports = async (guild) =>{
    let rows = await db.query(`SELECT id FROM channel WHERE guild_id = '${guild.id}';`).then(rows =>{return rows});
    let channelsToDelete = new Array();
    for(row of rows){
        channelsToDelete.push(row["id"]);
    }
    client.trackedChannels = client.trackedChannels.filter( item => !channelsToDelete.includes(item));
    
    db.query(`DELETE FROM guild WHERE id='${guild.id}';`);
    db.query(`DELETE FROM message WHERE guild_id = '${guild.id}';`);
    db.query(`DELETE FROM channel WHERE guild_id = '${guild.id}';`);
    db.query(`DELETE FROM user WHERE guild_id = '${guild.id}';`);

}