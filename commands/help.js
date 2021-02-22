const Discord=require("discord.js");
const { DiscordAPIError } = require("discord.js");
const client=require("../variables/client.js");

exports.run = (message, args) =>{
    const guildPrefix= client.guildPrefixes.get(message.guild.id)
    if(args.length===0){

        let adminCommands="```\r\n";
        let generalCommands="```\r\n"
        client.commands.forEach(cmd =>{
            if(cmd.config.adminCmd){
                adminCommands+=cmd.config.name+"\r\n";
            }
            else{
                generalCommands+=cmd.config.name+"\r\n";
            }
            
        })
        adminCommands+="```";
        generalCommands+="```";
        const helpEmbed=new Discord.MessageEmbed()
        .setAuthor("Guess the Message Author", client.user.displayAvatarURL())
        .setTitle("Help")
        .setDescription(`Hi, Welcome to guess the message author. The concept of the bot is that you will see a random message from this server and you have to guess who was the author. Down below you can see the available commands \n \n for details on a command use: **${guildPrefix}help <command> **`)
        .addField("Admin Commands", adminCommands, true)
        .addField("General Commands", generalCommands, true)
        .setFooter("By Doggi#4758")
        message.channel.send(helpEmbed)
    }
    else{
        const cmd=client.commands.get(args[0]);
        if(!cmd) return message.channel.send("there is no such command")

        const helpCommandEmbed=new Discord.MessageEmbed()
        .setAuthor("Help", client.user.displayAvatarURL())
        .setTitle(cmd.config.name)
        .addField("Description:", cmd.help.description)
        .addField("Usage:", "```"+guildPrefix+cmd.help.usage+"```")
        
        message.channel.send(helpCommandEmbed)
    }
}

exports.config = {
    name: "help",
    enabled: true,
    adminCmd: false,
}

exports.help = {
    description: "shows you the available commands or if you use it with a command it tells you about that command",
    usage: "help [command]"
}