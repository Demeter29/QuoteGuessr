const Discord = require("discord.js")
const client = require("../constants/client.js")
const db = require("../database/db.js")
const Canvas = require("canvas");
const singleMessageFilter = require("../filters/singleMessageFilter.js");
const disbut = require('discord-buttons')(client);

exports.run = async (message, args) => {
    const prefix = client.guildPrefixes.get(message.guild.id);

    let users = await db.query(`SELECT author_id, count(*) AS message_count FROM message WHERE guild_id='${message.guild.id}' GROUP BY author_id, guild_id HAVING message_count>=${client.config.minimalAmountOfMessages}`).then(rows => {return rows});
    for (let i = users.length - 1; i >= 0; i--) {
        if((message.guild.members.resolve(users[i]["author_id"]) == null) || (message.guild.members.resolve(users[i]["author_id"]).user.bot)) { 
            users.splice(i, 1);  
        }
    }
    

    let realUserID;
    let msgs;
    while(true){
        if(users.length<3){
            const notEnoughPlayersEmbed = new Discord.MessageEmbed()
            .setTitle("Error: You don't have enough members")
            .setDescription(`You need to have atleast 3 members's messages to play the game. \n\n Try to add new channels to the game with the \`${prefix}add\` command to increase the number of messages available.`)
            .setColor("#ff0830");

            return message.channel.send(notEnoughPlayersEmbed);
        }
        let randomIndex=Math.floor(Math.random() * ((users.length - 1) - 0 + 1)) + 0;
        realUserID = users[randomIndex]["author_id"];

        msgs = await db.query(`SELECT content, author_id, channel_id, time FROM message WHERE author_id='${realUserID}' AND guild_id='${message.guild.id}'`).then(rows => {return rows});
        msgs = singleMessageFilter(msgs, message.guild);
        if (msgs.length >= client.config.minimalAmountOfMessages) {
            break;
        }
        else{
            users.splice(randomIndex, 1);
        }
    }

    const options = [];
    options.push(realUserID);

    for (let i = 0; i < 2;) {
        let fakeAuthorID = users[Math.floor(Math.random() * ((users.length - 1) - 0 + 1)) + 0]["author_id"];
        if (fakeAuthorID === realUserID || options.includes(fakeAuthorID)) {
            continue;
        } else {
            options.push(fakeAuthorID);
            i++;
        }
    }
    shuffleArray(options);

    const canvas = Canvas.createCanvas(700, 400);
    const ctx = canvas.getContext('2d');
    ctx.font = "bold 25px arial, sans-serif ";
    ctx.fillStyle = "#c7d9df";

    const background = await Canvas.loadImage("./resources/singleMessage.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    let randomMessage;
    let lines;
    while(true){
        if(msgs.length<0) return;

        let randomIndex=Math.floor(Math.random() * ((msgs.length - 1) - 0 + 1)) + 0;
        randomMessage = msgs[randomIndex];

        lines = getLines(ctx, randomMessage["content"], 561);
        if (lines.length > 3) {
            msgs.splice(randomIndex, 1);
            continue;
        }
        break;
    }

    for (i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 110, 90 + (i * 30));
    }

    await drawAvatar(options[0], ctx, 105, 205, 48,  "#000000");
    await drawAvatar(options[1], ctx, 105, 280, 48,  "#000000");
    await drawAvatar(options[2], ctx, 105, 358, 48,  "#000000");

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'guessMessage.png');

    //buttons
    let buttonA = new disbut.MessageButton()
    .setStyle('gray')
    .setLabel('A')
    .setID('a'); 

    let buttonB = new disbut.MessageButton()
    .setStyle('gray') 
    .setLabel('B') 
    .setID('b');

    let buttonC = new disbut.MessageButton()
    .setStyle('gray') 
    .setLabel('C') 
    .setID('c');

    let playAgainButton = new disbut.MessageButton()
    .setStyle('blurple') 
    .setLabel('Play Again!') 
    .setID('playAgain');

    let saveMessageButton = new disbut.MessageButton()
    .setStyle('gray')
    .setLabel('Save message')
    .setID('saveMessage');

    const guessEmbed = new Discord.MessageEmbed()
    .setAuthor("playing: " + message.member.displayName, message.author.displayAvatarURL())
    .setTitle("Who wrote the following message?")
    .attachFiles(attachment)
    .setImage('attachment://guessMessage.png');

    let guessMessage = await message.channel.send({embed: guessEmbed, buttons: [buttonA, buttonB, buttonC]});

    //reply
    const filter = (button) => (true);
    const collector = guessMessage.createButtonCollector(filter, { time: 60000 });

    let correctAnswer = "abc".charAt(options.indexOf(realUserID));
    let correctAnswerString = `${correctAnswer.toUpperCase()}: ${message.guild.members.resolve(realUserID).displayName}`;
    let answer;

    collector.on('collect', async button => {
        button.defer();
        if(!(button.clicker.member.id==message.member.id)){
            collector.empty();
            const notThePlayerEmber = new Discord.MessageEmbed()
            .setTitle("Wrong Game")
            .setDescription(`you have recently clicked a button on someone's else game, you can only click buttons in your own game. To start a game use the \`${prefix}play\` command in the server **(not here!)**`)
            .setColor("#ff0830");

            return button.clicker.user.send(notThePlayerEmber);
        }
        answer = button.id;
        collector.stop();

        await db.query(`UPDATE user SET single_games_played=single_games_played+1, points = points-50 WHERE user_id='${message.author.id}' AND guild_id='${message.guild.id}'`).then(async results => {
            if (results.affectedRows === 0) {
                await db.query(`INSERT INTO user (user_id, guild_id, single_games_played, single_games_won, current_winstreak, highest_winstreak, points) VALUES('${message.member.id}', '${message.guild.id}', 1, 0, 0, 0, -50)`);
            }
        });

        if (answer == correctAnswer) {
            win();
        } else {
            lose(correctAnswerString);
        }
    });
    collector.on('end', async collected =>{
        buttonA.setDisabled();
        buttonB.setDisabled();
        buttonC.setDisabled();

        if(answer!=correctAnswer){
            switch (answer){
                case "a":
                    buttonA.setStyle("red");
                break;
                case "b":
                    buttonB.setStyle("red");
                break;
                case "c":
                    buttonC.setStyle("red");
                break;
            }
        }
        
        switch (correctAnswer){
            case "a":
                buttonA.setStyle("green");
            break;
            case "b":
                buttonB.setStyle("green");
            break;
            case "c":
                buttonC.setStyle("green");
            break;
        }

        guessMessage.edit( {embed: guessEmbed, buttons: [buttonA, buttonB, buttonC]});

        if(collected.size==0){
            const timesUpEmbed = new Discord.MessageEmbed()
            .setAuthor("playing: "+message.member.displayName, message.author.displayAvatarURL())
            .setTitle("Time's up!")
            .setDescription("You took the maximum of 60 seconds to guess.")
            .setColor("#ff0830");

            let endMessage = await message.channel.send({embed: timesUpEmbed, button: playAgainButton});
            end(endMessage, timesUpEmbed);
        }
    });


    async function win(){
        await db.query(`UPDATE user SET single_games_won=single_games_won+1, current_winstreak = current_winstreak+1, points = points+150 WHERE guild_id='${message.guild.id}' AND user_id = '${message.member.id}'`);
        
        let currentWinstreak, points;
        await db.query(`SELECT current_winstreak,highest_winstreak, points FROM user WHERE guild_id='${message.guild.id}' AND user_id = '${message.member.id}'`).then(rows =>{
            let rowCurrentWinstreak= rows[0]["current_winstreak"];

            if(rowCurrentWinstreak>rows[0]["highest_winstreak"]){
                db.query(`UPDATE user SET highest_winstreak = ${rowCurrentWinstreak}  WHERE guild_id='${message.guild.id}' AND user_id = '${message.member.id}'`);
            }

            currentWinstreak=rowCurrentWinstreak;
            points=rows[0]["points"];
            });
       
        const winEmbed = new Discord.MessageEmbed()
        .setTitle("Correct!")
        .setColor("#23ff00")
        .setAuthor("playing: "+message.member.displayName, message.author.displayAvatarURL())
        .setDescription(`You got +100 points (total: ${points}) \n\nCurrent winstreak: **${currentWinstreak}**`);

        let endMessage =await message.channel.send( {buttons: [playAgainButton, saveMessageButton], embed: winEmbed});
        end(endMessage, winEmbed);

    }

    async function lose(correctAnswerString){
        db.query(`UPDATE user SET current_winstreak = 0 WHERE guild_id=${message.guild.id} AND user_id = ${message.member.id}`);
        let points= await db.query(`SELECT points FROM user WHERE user_id='${message.member.id}' AND guild_id = '${message.guild.id}'`).then(rows=>{return rows[0]["points"]});

         const loseEmbed = new Discord.MessageEmbed()
        .setTitle("Wrong!")
        .setColor("#ff0830")
        .setDescription(`The correct answer was ${correctAnswerString}\n\nYou lost 50 points (total: ${points})`)
        .setAuthor("playing: "+message.member.displayName, message.author.displayAvatarURL());

        let endMessage = await message.channel.send( {buttons: [playAgainButton, saveMessageButton], embed: loseEmbed});
        end(endMessage, loseEmbed);
    }

    async function end(endMessage, embedWithoutButtons){
        const filter = (button) => (true);
        const collector = endMessage.createButtonCollector(filter, {  time: 240000 });

        collector.on('collect', async button => {
            button.defer();

            if(button.id=="playAgain"){
                if(button.clicker.member.id==message.member.id){
                    playAgainButton.setDisabled();
                    endMessage.edit( {embed: embedWithoutButtons, buttons: [playAgainButton, saveMessageButton]});
                }
                else{
                    collector.users.clear()
                    const notThePlayerEmber = new Discord.MessageEmbed()
                    .setTitle("Wrong Game")
                    .setDescription(`you have recently clicked a button on someone's else game, you can only click buttons in your own game. To start a game use the \`${prefix}play\` command in the server **(not here!)**`)
                    .setColor("#ff0830");

                    return button.clicker.user.send(notThePlayerEmber);
                }
                let phantomMessage=button.message;
                phantomMessage.member = button.clicker;
                phantomMessage.author = button.clicker.user;
                client.commands.get("play").run(phantomMessage);
            }
            else{   //save Message
                saveMessageButton.setDisabled();
                endMessage.edit( {embed: embedWithoutButtons, buttons: [playAgainButton, saveMessageButton]});

                const canvas = Canvas.createCanvas(700, 200);
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = "#32353b";
                void ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#dcdad9";

                await drawAvatar(realUserID, ctx, 55, 45, 55, "#dcdad9");
                ctx.font = "bold 25px arial, sans-serif ";

                for (i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], 110, 90 + (i * 30));
                }

                ctx.font = "bold 20px arial, sans-serif ";
                const date = "-"+randomMessage["time"].toDateString();
                ctx.fillText(date, 500, 180);
                const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'savedMessage.png');
                
                const saveMessageEmbed = new Discord.MessageEmbed()
                .attachFiles(attachment)
                .setImage('attachment://savedMessage.png');
                message.channel.send(saveMessageEmbed);
            }         
        });

        collector.on('end', () =>{
            playAgainButton.setDisabled();
            saveMessageButton.setDisabled();
            endMessage.edit( {embed: embedWithoutButtons, buttons: [playAgainButton, saveMessageButton]});
        });    
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    async function drawAvatar(userID, ctx, x, y, diameter, nameColor) {
        ctx.font = `bold ${diameter/2}px arial, sans-serif `;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, diameter / 2, 0, Math.PI * 2, true);
        ctx.clip();
        const member = message.guild.members.resolve(userID);
        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({format: 'jpg'}));
        ctx.drawImage(avatar, x - (diameter / 2), y - (diameter / 2), diameter, diameter);
        ctx.restore();

        ctx.fillStyle =nameColor;
        ctx.fillText(member.displayName, x + 35, y + 7)
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
};

exports.config = {
    name: "play",
    adminCmd: false,
};

exports.help = {
    description: "The bot will show you a message from this server and you'll have to guess which user said that. You will see the letters A, B or C next to them, simply click the button with the correct letter and you will win if you guessed the correct person!",
    usage: [
        "play"
    ],
    usageHelp: [
        ""
    ]
};