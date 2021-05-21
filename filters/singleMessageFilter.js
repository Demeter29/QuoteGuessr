const message = require("../events/message");


module.exports = (messages, guild) =>{
    
    for(let i=messages.length-1;i>=0;i--){
        if(messages[i].content.length<5 || messages[i].content.length>200){        
            messages.splice(i, 1);
        }
        else if(!guild.members.resolve(messages[i]["author_id"])){ //no longer member
            messages.splice(i, 1);
        } 
        else if(messages[i].content.split(" ").length<2){
            messages.splice(i, 1);
        }
        else if(messages[i].attachments){    //message has attachments
            messages.splice(i, 1);
        }
        else if(messages[i].content.startsWith("https://") || messages[i].content.startsWith("http://")){ //message is link
            messages.splice(i, 1);
        }
        //else if(messages[i].system){
        //    messages.splice(i, 1);
       // }
        else if(guild.members.resolve(messages[i]["author_id"]).bot){ //
            messages.splice(i, 1);
        }
        else if(messages[i].content.includes("\n")){
            messages.splice(i, i)
        }
        //else if()   //if the next message is a bot then its most likely a bot command.
    }
    //messages = messages.filter(msg => !msg.author.bot);


    

    return messages
}