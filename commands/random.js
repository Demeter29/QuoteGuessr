const Discord = require("discord.js")
const db = require("../database/db.js")
const Canvas = require("canvas");
const { DiscordAPIError } = require("discord.js");
const singleMessageFilter=require("../filters/singleMessageFilter.js")

exports.run= async (message, args) =>{

    let users=await db.query(`SELECT author_id, count(*) as message_count FROM message WHERE guild_id=${message.guild.id} GROUP BY author_id, guild_id ORDER BY message_count DESC`).then(rows=>{return rows});

    let randomUserID=0;
    do{
        randomUserID=users[Math.floor(Math.random() * (( users.length-1) - 0 + 1)) + 0]["author_id"];
    }
    while(!message.guild.members.resolve(randomUserID))
    
    const options=[];
    options.push(randomUserID)
    for(let i=0;i<2;){
        let fakeAuthorID=users[Math.floor(Math.random() * (( users.length-1) - 0 + 1)) + 0]["author_id"];

        if(fakeAuthorID===randomUserID || options.includes(fakeAuthorID) || !message.guild.members.resolve(fakeAuthorID)){
            continue;
        }
        else{
            options.push(fakeAuthorID);
            i++;
        }     
    }
    shuffleArray(options)
    
    let msgs=await db.query(`SELECT content, author_id, channel_id, time FROM message WHERE author_id=${randomUserID} AND guild_id=${message.guild.id}`).then(rows => {return rows})

    msgs=singleMessageFilter(msgs, message.guild);

    let randomMessage=msgs[Math.floor(Math.random() * (( msgs.length-1) - 0 + 1)) + 0];
    
    if(msgs.length<10){
        return require("./random.js").run(message, args);
    }
    message.channel.send(`${randomMessage["content"]} sent by ${message.guild.members.resolve(randomUserID)}`)

    //Canvas 
    const canvas = Canvas.createCanvas(700, 400);
    const ctx = canvas.getContext('2d');
    ctx.font = "bold 25px arial, sans-serif ";
    ctx.fillStyle ="#c7d9df" 
    
    const background = await Canvas.loadImage("./resources/singleMessagev1.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    
    const lines= getLines(ctx,randomMessage["content"], 561);
    console.log(lines.length)
    if(lines.length>3){
        console.log("too long so re run");
        return require("./random.js").run(message, args);
        
        
    }
    for(i=0;i<lines.length;i++){
        ctx.fillText(lines[i],110, 90+(i*30));
    }
    

    await drawAvatar(options[0], 105, 205)
    await drawAvatar(options[1], 105, 280)
    await drawAvatar(options[2], 105, 358)

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'message.png');
    message.channel.send(attachment)

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
    name:"random",
    adminCmd:false,

}