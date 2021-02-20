const client=require("../variables/client.js");

exports.run = (message, args) =>{
    if(args.length===0){
        message.channel.send("TODO");
    }
    else{
        const cmd=client.commands.get(args[0]);
        if(!cmd) return message.channel.send("there is no such command")

        message.channel.send(`Description: ${cmd.help.description}, Usage: ${client.guildPrefixes.get(message.guild.id)}${cmd.help.usage}`)
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