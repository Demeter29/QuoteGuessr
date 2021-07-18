const asleep = require("asleep");

/**
 * 
 * @param {Object} channel The channel of object from which you want to fetch the messages
 * @param {Number} amount The maximum number of messages to fetch
 * @returns An object with 2 property: messages: The array with the fetched messages; lastID: the id of the last message we fetched;
 */

module.exports = async (channel, amount) =>{
    return new Promise(async (resolve, reject) =>{
        let messages = [];
        let lastID;

        try{
            while (true) { 
                const fetchedMessages = await channel.messages.fetch({
                    limit: 100, //maximum allowed by discord api is 100
                    ...(lastID && { before: lastID }),
                });
                
                if (fetchedMessages.size === 0 || messages.length>=amount) {                    
                    return resolve({
                        "messages": messages,
                        "lastID": lastID
                    });
                }

                messages = messages.concat(Array.from(fetchedMessages.values()));
                lastID = fetchedMessages.lastKey();
                console.log(messages.length)
                await asleep(1200); //to not get ratelimited by discord
            } 
        }catch(error){
            reject(error);
        }   
    })
}

    