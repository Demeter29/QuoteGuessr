const asleep = require("asleep");

/**
 * 
 * @param {Object} channel The channel of object from which you want to fetch the messages
 * @param {Number} amount The maximum number of messages to fetch
 * @param {String} lastID Optional: fetch messages from this message (id)
 * @returns An object with 2 property: messages: The array with the fetched messages; lastID: the id of the last message we fetched;
 */

module.exports = async (channel, amount, lastID) =>{
    return new Promise(async (resolve, reject) =>{
        let messages = [];

        try{
            while (true) { 
                const fetchedMessages = await channel.messages.fetch({
                    limit: 100,
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
                await asleep(1200);   
            } 
        }catch(error){
            reject(error);
        }   
    })
}

    