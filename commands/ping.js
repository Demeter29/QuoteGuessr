const db=require("../database/db.js")

exports.run = (message, args) =>{
    message.reply("pong")
    console.log(message.createdTimestamp)
}

exports.config = {
    name: "ping",
    enabled: true,
    adminCmd: true,
}