const mysql=require("mysql2");
const client=require("../variables/client.js")

const db =mysql.createPool({
    user: client.config.dbUser,
    password: client.config.dbPassword,
    database: client.config.dbName
})

function query(sql, inserts){
    return new Promise( (resolve) =>{ //TODO: no rejection!
        db.query(sql, inserts, (err, rows) =>{        
            if(err){
                console.log("Database error: "+err);
                if(!client.users.resolve(client.config.devID)) return; // dev and bot must be on a server together
                client.users.resolve(client.config.devID).send("Database error: "+err); 
            }
            else resolve(rows);                               
        });
    });

};

exports.query = query;