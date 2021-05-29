const Discord=require("discord.js");
const { DiscordAPIError } = require("discord.js");
const client=require("../variables/client.js");
const db = require("../database/db.js");

exports.run = async (message, args) =>{
    const prefix= client.guildPrefixes.get(message.guild.id)
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

        let setupString="";
        await db.query(`SELECT is_setup FROM guild WHERE id=${message.guild.id}`).then(rows=>{
            if(!rows[0]["is_setup"]){
                setupString=`\n\n**IMPORTANT: You still haven't set up the server, before playing you have to do that with the \`${prefix}setup\` command!**`;
            }
            else{
                setupString=`\n\nIf you just want to play then use ${prefix}play command.`
            }
        });

        const helpEmbed=new Discord.MessageEmbed()
        .setAuthor("Guess the Message Author", client.user.displayAvatarURL())
        .setTitle("Help")
        .setDescription(`Hi, welcome to guess the message author. The concept of the bot is that you will see a random message from this server and you have to guess who was the author. Down below you can see the available commands. \n \n for details on a command use: **${prefix}help <command>** ${setupString}`)
        .addField("Admin Commands", adminCommands, true)
        .addField("General Commands", generalCommands, true)
        .addField("‎‎‎", "Developed by Doggi#4758 \n[support server](https://discord.gg/UCEJysf2Ym)")
        message.channel.send(helpEmbed)
    }
    else{
        const cmd=client.commands.get(args[0]);
        if(!cmd) return message.channel.send("there is no such command")

        let output="";
        for(let i=0;i<cmd.help.usage.length;i++){
            output+=`\`\`\`${prefix}${cmd.help.usage[i]}\`\`\` ${cmd.help.usageHelp[i]}\n\n`;
        }

        const helpCommandEmbed=new Discord.MessageEmbed()
        .setAuthor("Help", client.user.displayAvatarURL())
        .setTitle(cmd.config.name)
        .addField("Description:", cmd.help.description)
        .addField("Usage:", output)
        
        
        message.channel.send(helpCommandEmbed)
    }
}

exports.config = {
    name: "help",
    enabled: true,
    adminCmd: false,
}

exports.help = {
    description: "shows you the available commands or if you use it with a command then it explains that command to you.",
    usage: [
        "help",
        "help [command]"
    ],
    usageHelp : [
        "list all the available commands",
        "tells you about that command"
    ]
}