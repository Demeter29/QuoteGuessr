module.exports = (messages, guild) =>{
    
    outerloop:
    for(let i=messages.length-1;i>=0;i--){
        if(messages[i].content.length<5 || messages[i].content.length>200){        
            messages.splice(i, 1);
        }
        else if(messages[i].content.split(" ").length<10){
            messages.splice(i, 1);
        }
        else if(messages[i].attachments){
            messages.splice(i, 1);
        }
        else if(messages[i].content.startsWith("https://") || messages[i].content.startsWith("http://")){ //message is link
            messages.splice(i, 1);
        }
        else if(messages[i].content.includes("\n")){
            messages.splice(i, i)
        }


        //modifiers
        else{
            const userMentions = messages[i].content.match(/<@!?[0-9]{18}>/g);
            
            if(userMentions!=null){
                for(mention of userMentions){
                    const id=mention.match(/[0-9]{18}/g)[0];
                    const member = guild.members.resolve(id);
                    if(member){
                        messages[i].content = messages[i].content.replace(mention, "@"+member.displayName);
                    }
                    else{
                        messages.splice(i, i);
                        continue outerloop;
                    }
                }
            }
            
            const channelMentions = messages[i].content.match(/<#[0-9]{18}>/g);

            if(channelMentions!=null){
                for(mention of channelMentions){
                    const id=mention.match(/[0-9]{18}/g)[0];
                    const channel = guild.channels.resolve(id);
                    if(channel){
                        messages[i].content = messages[i].content.replace(mention, "#"+channel.name);
                    }
                    else{
                        messages.splice(i, i);
                        continue outerloop;
                    }
                }  
            }        
        }   
    }

    return messages;
}