const client = require("../constants/client.js");
const db=require("../database/db.js");

module.exports = async (member) => {
    db.query(`DELETE FROM user WHERE user_id='${member.id}' AND guild_id = '${member.guild.id}'`);
}