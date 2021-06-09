

module.exports = (messages) =>{
    
    for(let i=messages.length-1;i>=0;i--){
        //if(i>0 && messages[i-1].author.bot){   //if the next message is a bot then its most likely a bot command.     
        //    messages.splice(i, 1);
       // }      
    }
    //messages = messages.filter(msg => !msg.author.bot);


    for(message of messages){
    }

    return messages
}