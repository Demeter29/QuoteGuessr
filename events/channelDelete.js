const db=require("../database/db.js");
const client=require("../constants/client.js");

module.exports= async channel =>{
    const row=db.query(`SELECT id FROM channel WHERE id='${channel.id}'`).then( rows=>{return rows});

    if(row.length==0){
        return;
    }
    else{
        await db.query(`DELETE FROM channel WHERE id='${channel.id}'`);
        await db.query(`DELETE FROM message WHERE channel_id='${channel.id}'`);
    }
};