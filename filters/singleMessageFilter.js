const message = require("../events/message");


module.exports = (messages, guild) =>{
    
    for(let i=messages.length-1;i>=0;i--){
        console.log(messages[i])
        if(messages[i].content.length<5 || messages[i].content.length>200){   //if the next message is a bot then its most likely a bot command.     
            messages.splice(i, 1);
        }
        else if(!guild.members.resolve(messages[i]["author_id"])){ //no longer member
            messages.splice(i, 1);
        } 
        else if(messages[i].content.split(" ").length<2){
            messages.splice(i, 1);
        }
        //else if(messages[i].attachments.size>0){    //message is image
        //    messages.splice(i, 1);
       // }
        else if(messages[i].content.startsWith("https://") || messages[i].content.startsWith("http://")){ //message is link
            messages.splice(i, 1);
        }
        //else if(messages[i].system){
        //    messages.splice(i, 1);
       // }
        else if(guild.members.resolve(messages[i]["author_id"]).bot){ //
            messages.splice(i, 1);
        }          
    }
    //messages = messages.filter(msg => !msg.author.bot);


    

    return messages
}