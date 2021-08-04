const Discord = require('discord.js');
const client = require("./constants/client.js");
client.config=require("./config.json");
const asleep=require("asleep")
const fs=require("fs");

async function init(){
    client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    commandFiles.forEach(file =>{
        const command = require(`./commands/${file}`);
        client.commands.set(command.config.name, command);
    });

    const eventFiles = fs.readdirSync("./events/").filter(file => file.endsWith('.js'));
    eventFiles.forEach(file =>{
        const eventName = file.split(".")[0];
        const event = require(`./events/${file}`);
        client.on(eventName, event.bind(null));
    });

    if(client.shard.ids[0] == client.config.numberOfShards-1){
        await asleep(10000) //to make sure the last shard is also ready!
        client.emit('globalReady');
    }
}

init();

process.on("rejectionHandled"   , ( err ) => console.error( err ) );
process.on("unhandledRejection" , ( err ) => console.error( err ) );
process.on("uncaughtException"  , ( err ) => console.error( err ) );

client.login(client.config.token);