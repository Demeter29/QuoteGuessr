const client=require("../variables/client.js")

module.exports = async (message) =>{
    
    if (message.author.bot) return;
    const kada=[];
    kada[message.channel.id]="5";
    console.log(kada[message.channel.id]);

    const prefix=client.guildPrefixes.get(message.guild.id);

    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(prefixMention)) return message.reply(`My prefix on this guild is \`${prefix}\``);

    if(!message.content.toLowerCase().startsWith(prefix)) return;

    const args=message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    // If the member on a guild is invisible or not cached, fetch them. not sure if needed!
    if (message.guild && !message.member) await message.guild.members.fetch(message.author); 
    
    const cmd = client.commands.get(command);
    if (!cmd) return;

    if(!message.guild) return message.channel.send("Sorry, I don't take dms :)")
    
    if(cmd.config.adminCmd && !message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("you don't have permissions for this command")

    cmd.run(message, args);

    

    
}