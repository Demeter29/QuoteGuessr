const client=require("../variables/client.js");
const db=require("../database/db.js");

module.exports = async (message) =>{

    if(client.trackedChannels.includes(message.channel.id)){
        await db.query("INSERT INTO message VALUES(?,?,?,?,?, FROM_UNIXTIME(?*0.001))", [message.id, message.author.id, message.content, message.channel.id, message.guild.id, message.createdTimestamp]);
    }

    if (message.author.bot) return;
    if(!message.guild) return message.channel.send("Sorry, I don't take dms :)");
    const prefix=client.guildPrefixes.get(message.guild.id);

    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(prefixMention)) return message.reply(`My prefix on this guild is \`${prefix}\``);

    if(!message.content.toLowerCase().startsWith(prefix)) return;

    const args=message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    // If the member on a guild is invisible or not cached, fetch them. TODO: not sure if really needed
    if (message.guild && !message.member) await message.guild.members.fetch(message.author); 
    
    const cmd = client.commands.get(command);
    if (!cmd) return;
    
    if(cmd.config.adminCmd && !message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("you don't have permissions for this command");

    cmd.run(message, args);

}