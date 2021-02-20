const mysql=require("mysql2");
const client=require("../variables/client.js")

const db=mysql.createConnection({
    user: client.config.dbUser,
    password: client.config.dbPassword,
    database:client.config.dbName
});

db.connect(err=>{
    if(err) throw err;
    console.log("connected to database")
})

function query(sql, inserts){
    return new Promise( (resolve) =>{ //no rejection!
        db.query(sql, inserts, (err, rows) =>{        
            if(err){
                console.log(err);
                if(!client.users.resolve(client.config.devID)) return; // if dev not in a guild with dev
                client.users.resolve(client.config.devID).send("!!ERROR: probably database error: "+err); 
                
            }
            else resolve(rows);                               
        });
    });

};

exports.query = query;