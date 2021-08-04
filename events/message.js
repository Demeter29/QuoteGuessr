const Discord = require("discord.js");
const client=require("../constants/client.js");
const db=require("../database/db.js");

module.exports = async (message) =>{
    if(client.trackedChannels.includes(message.channel.id)){
        await db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp]);
    }

    if (message.author.bot) return;
    if(!message.guild) return;
    const prefix=client.guildPrefixes.get(message.guild.id);

    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(prefixMention)) return message.reply(`My prefix on this guild is \`${prefix}\` and to get my list of commands use \`${prefix}help\``);

    if(!message.content.toLowerCase().startsWith(prefix)) return;

    const args=message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    // If the member on a guild is invisible or not cached, fetch them. TODO: not sure if really needed
    if (message.guild && !message.member) await message.guild.members.fetch(message.author); 
    
    const cmd = client.commands.get(command);
    if (!cmd) return;
    
    if(cmd.config.adminCmd && !(message.member.hasPermission("ADMINISTRATOR") || (message.member.id==client.config.devID)) ) return message.channel.send("you don't have permissions for this command");

    let rows = await db.query(`SELECT is_setup FROM guild WHERE id='${message.guild.id}'`).then(rows =>{return rows})
    if(rows[0]["is_setup"]==0){
        if(!(cmd.config.name=="setup" || cmd.config.name=="help" || cmd.config.name=="prefix" || cmd.config.name=="test")){
            const notSetupEmbed=new Discord.MessageEmbed()
            .setTitle("Your server has not been set up")
            .setDescription(`Before you can play, you need to set up the server with the \`${prefix}setup\` command!`)
            .setColor("#ff0830");

            return message.channel.send(notSetupEmbed);
        }
    }

    cmd.run(message, args);
}