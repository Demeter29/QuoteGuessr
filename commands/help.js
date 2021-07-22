const Discord=require("discord.js");
const { DiscordAPIError } = require("discord.js");
const client=require("../constants/client.js");
const db = require("../database/db.js");
const disbut = require("discord-buttons");

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
        await db.query(`SELECT is_setup FROM guild WHERE id='${message.guild.id}'`).then(rows=>{
            if(!rows[0]["is_setup"]){
                setupString=`\n\n**IMPORTANT: You still haven't set up the server, before playing you have to do that with the \`${prefix}setup\` command!**`;
            }
            else{
                setupString=`\n\nIf you just want to play then use the ${prefix}play command.`
            }
        });

        const helpEmbed=new Discord.MessageEmbed()
        .setAuthor("Quote Guessr", client.user.displayAvatarURL())
        .setTitle("Help")
        .setDescription(`Welcome to Quote Guessr. The concept of the bot is that you will see a random message from this server and you have to guess who was the author. Down below you can see the available commands. ${setupString} \n \n for details on a command use: **${prefix}help <command>**`)
        .setColor("#05c963")
        .addField("Admin Commands", adminCommands, true)
        .addField("General Commands", generalCommands, true)
        .setFooter("Developed by Doggi#4758")
        message.channel.send( {buttons: [supportServerButton, inviteButton, githubButton], embed: helpEmbed})
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
        .setColor("#05c963")
        .addField("Description:", cmd.help.description)
        .addField("Usage:", output)
        
        
        message.channel.send(helpCommandEmbed)
    }
}

const supportServerButton = new disbut.MessageButton()
.setStyle("url")
.setLabel("Support Server")
.setURL("https://discord.gg/HD5eV2qKsA")

const githubButton = new disbut.MessageButton()
.setStyle("url")
.setLabel("Github")
.setURL("https://github.com/Demeter29/QuoteGuessr")

const inviteButton = new disbut.MessageButton()
.setStyle("url")
.setLabel("Invite bot to your server")
.setURL("https://discord.com/api/oauth2/authorize?client_id=809631893627994128&permissions=0&scope=bot")





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