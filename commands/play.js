const Discord = require("discord.js")
const client = require("../variables/client.js")
const db = require("../database/db.js")
const Canvas = require("canvas");
const { DiscordAPIError } = require("discord.js");
const singleMessageFilter=require("../filters/singleMessageFilter.js")



exports.run= async (message, args) =>{
    const prefix=client.guildPrefixes.get(message.guild.id);

    let users=await db.query(`SELECT author_id, count(*) AS message_count FROM message WHERE guild_id=${message.guild.id} GROUP BY author_id, guild_id HAVING message_count>=10 ORDER BY message_count DESC`).then(rows=>{return rows});
    for (let i=users.length-1;i>=0;i--){
        //console.log(message.guild.members.resolve(users[i]["author_id"]))
        let msgs=await db.query(`SELECT content, author_id, channel_id, time FROM message WHERE author_id=${users[i]["author_id"]} AND guild_id=${message.guild.id}`).then(rows => {return rows})
        msgs=singleMessageFilter(msgs, message.guild);
        console.log(users)
        if(msgs.length<5){
            users.splice(i, 1);
        }
        else if(message.guild.members.resolve(users[i]["author_id"]) == null){
            console.log("got him"+users[i])
            users.splice(i,1);
        }
        
        
    }  

    for(user of users){
        //console.log(user)
        //console.log(message.guild.members.resolve(user).displayName)
    }

    console.log(users.length)
    if(users.length<3){
        message.channel.send("There aren't enough active users in the saved database from this server to play the game, either load more messages or get the server more active");
        return;
    }

    let randomUserID=0;
    let forIndex=0;
    do{ 
        if(forIndex>200){   //prevent infinite loop
            return message.channel.send("There aren't enough active users in the saved database from this server to play the game, either load more messages or get the server more active")
        }

        randomUserID=users[Math.floor(Math.random() * (( users.length-1) - 0 + 1)) + 0]["author_id"];
        forIndex++;
    }
    while(!message.guild.members.resolve(randomUserID))
    
    const options=[];
    options.push(randomUserID)
    //console.log(users.length)
    for(let i=0;i<2;){
        let fakeAuthorID=users[Math.floor(Math.random() * (( users.length-1) - 0 + 1)) + 0]["author_id"];
        if(fakeAuthorID===randomUserID || options.includes(fakeAuthorID) ){
            continue;
        }
        else{
            options.push(fakeAuthorID);
            i++;
        }     
    }
    
    shuffleArray(options)
    //console.log(options)
    
    let msgs=await db.query(`SELECT content, author_id, channel_id, time FROM message WHERE author_id=${randomUserID} AND guild_id=${message.guild.id}`).then(rows => {return rows})
    msgs=singleMessageFilter(msgs, message.guild);

    //console.log(msgs.length)

    let randomMessage=msgs[Math.floor(Math.random() * (( msgs.length-1) - 0 + 1)) + 0];
    
    
    //message.channel.send(`${randomMessage["content"]} sent by ${message.guild.members.resolve(randomUserID)}`)

    //Canvas 
    const canvas = Canvas.createCanvas(700, 400);
    const ctx = canvas.getContext('2d');
    ctx.font = "bold 25px arial, sans-serif ";
    ctx.fillStyle ="#c7d9df" 
    
    const background = await Canvas.loadImage("./resources/singleMessagev3.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    
    const lines= getLines(ctx,randomMessage["content"], 561);
    if(lines.length>3){
        console.log("too long so re run");
        return require("./play.js").run(message, args);
        
        
    }
    for(i=0;i<lines.length;i++){
        ctx.fillText(lines[i],110, 90+(i*30));
    }
    

    await drawAvatar(options[0], 105, 205)
    await drawAvatar(options[1], 105, 280)
    await drawAvatar(options[2], 105, 358)

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'guessMessage.png');

    const guessEmbed=new Discord.MessageEmbed()
    .setAuthor("playing: "+message.member.displayName, message.author.displayAvatarURL())
    .setTitle("Who wrote the following message?")
    .attachFiles(attachment)
    .setImage('attachment://guessMessage.png')
    .setFooter("Answer with the correct number")
    message.channel.send(guessEmbed)

    //reply

    const filter = m => ((m.content.startsWith(prefix+"play") || ["1", "2", "3"].includes(m.content)) && m.author.id===message.author.id);
    let collector = message.channel.createMessageCollector(filter, {max:1, time: 30000 });

    collector.on('end', collected =>{
        let correctAnswer=options.indexOf(randomUserID)+1; //+1 bcuz of indexing
        let correctAnswerString=`The correct answer was ${correctAnswer}: ${message.guild.members.resolve(randomUserID).displayName}`;

        db.query(`UPDATE user SET single_games_played=single_games_played+1 WHERE user_id=${message.author.id} AND guild_id=${message.guild.id}`).then(results=> {
            if(results.affectedRows===0){
                db.query(`INSERT INTO user (user_id, guild_id, single_games_played, single_games_won) VALUES(${message.member.id}, ${message.guild.id}, 1, 0)`);
            }
        });
        if(collected.size===0){
            
            message.channel.send(`no reply in 30 seconds, game ended! ${correctAnswerString}`);
        }
        else{
            let answer=collected.first().content.toLowerCase();
            
            if(answer.startsWith((prefix+"play").toLowerCase())){
                return;
            }
            else if(answer==correctAnswer){
                message.channel.send("correct");
                db.query(`UPDATE user SET single_games_won=single_games_won+1`);
            }
            else{
                message.channel.send("wrong, "+correctAnswerString);
                
            }
            
        }     
    });



    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    async function drawAvatar(userID, x, y){
        const size=48

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size/2 , 0, Math.PI * 2, true);
        ctx.clip();
        const member=message.guild.members.resolve(userID);
        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
        ctx.drawImage(avatar, x-(size/2), y-(size/2), size, size);
        ctx.restore();

        ctx.fillStyle ="#000000"    
        ctx.fillText(member.displayName, x+35,y+7)
    }

    function getLines(ctx, text, maxWidth) {
        var words = text.split(" ");
        var lines = [];
        var currentLine = words[0];
    
        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}

exports.config= {
    name:"play",
    adminCmd:false,

}

exports.help={
    description: "minigame",
    usage: "play"
}