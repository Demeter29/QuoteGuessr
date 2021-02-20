const Discord = require('discord.js');
const client = require("./variables/client.js");
client.config=require("./config.json");
const db=require("./database/db.js")

const fs=require("fs")
var asleep = require("asleep");

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commandFiles.forEach(file => {
    const command = require(`./commands/${file}`);
	client.commands.set(command.config.name, command);
});

const eventFiles = fs.readdirSync("./events/").filter(file => file.endsWith('.js'));
eventFiles.forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, event.bind(null));
});


client.login(client.config.token);



