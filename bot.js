const Discord = require('discord.js');
const client = require("./variables/client.js");
client.config=require("./config.json");
const fs=require("fs")

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

//log errors
client.on("disconnect", () => client.logger.log("Bot is disconnecting...", "warn"))
    .on("reconnecting", () => client.logger.log("Bot reconnecting...", "log"))
    .on("error", (e) => client.logger.log(e, "error"))
    .on("warn", (info) => client.logger.log(info, "warn"));

//unhandled errors
process.on("unhandledRejection", (err) => {
  console.error(err);
});


client.login(client.config.token);



