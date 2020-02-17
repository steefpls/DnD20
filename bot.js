
var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
require('dotenv').config();

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// Initialize Discord Bot
const client = new Discord.Client();

//File save system
const fs = require('fs') //importing file save
var dataPath = "./playerdata.json";
var dataRead = fs.readFileSync(dataPath);
var dataFile = JSON.parse(dataRead); //ready for use

client.on('ready', () => {
    console.log(`\nLogged in as ${client.user.tag}!\n`);
})

client.on('message', message => {
        // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
        cmd = cmd.toLowerCase();
        args = args.splice(1);

        if (cmd == 'ping') {
            sendcodemessage('pong!', message);

        }

        else if (cmd == 'r' || cmd == 'roll') { //If rolling

            var parsetxt = "";
            var hasHashtag = false;
            var printtext = "";
            var finaltext = "";
            var number = "";
            var displaytext = "";

            var operator = "";
            var txtlist = [];

            if (!args[0]) {
                sendcodemessage("Rolling... nothing?", message);

            }
            else {
                for (i = 0; i < args.length; i++) {
                    if (args[i].length > 15) {
                        sendcodemessage("Number too big, brain too small :(", message);
                        return;
                    }
                    for (o = 0; o < args[i].length; o++) {
                        if (args[i][o] == "$") {
                            hasHashtag = true;
                        }
                        if (!hasHashtag) {
                            parsetxt += args[i][o];
                        }
                        else {
                            printtext += args[i][o];
                        }
                    }

                }

                var n = parsetxt.length;

                for (i = 0; i < n; i++) {

                    prevoperator = operator;
                    var currentalpha = parsetxt[i];

                    if (!isNaN(currentalpha) || currentalpha.toLowerCase() == 'd') { //if is a number or d
                        number += currentalpha.toLowerCase();
                        if (i == n - 1) {   //if last character
                            txtlist.push(number.toLowerCase());
                        }
                    }

                    else {
                        if (number != '') {
                            txtlist.push(number);
                        }

                        txtlist.push(currentalpha);
                        number = "";
                    }


                }
                for (i = 0; i < txtlist.length; i++) {
                    finaltext += txtlist[i];
                    if (i < txtlist.length - 1) {
                        finaltext += " ";
                    }
                }



                var alphanum = "1234567890*+-/dD";
                for (i = 0; i < txtlist.length; i++) {
                    for (o = 0; o < txtlist[i].length; o++) {
                        if (!alphanum.includes(txtlist[i][o])) {
                            sendcodemessage('Invalid syntax, use proper variables. Eg: "!r 2d6"', message);
                            return;
                        }
                    }
                }
                if (!hasHashtag) {
                    displaytext += "Rolling: " + finaltext + "...\n\n";
                }
                else {
                    displaytext += "Rolling: " + finaltext + "...\n\n";
                }



                finaltext = "";
                for (i = 0; i < txtlist.length; i++) {

                    if (txtlist[i].includes("d")) {

                        var numbers = txtlist[i].split("d");

                        if (!numbers[0]) {
                            var randvar = randomint(1, parseInt(numbers[1]));
                            finaltext += randvar + " ";
                            displaytext += "(" + randvar + ") ";
                        }
                        else {
                            var dicemultiple = parseInt(numbers[0]);
                            if (dicemultiple > 400) {
                                sendcodemessage("Too many die, I want die x.x", message);
                                return;
                            }

                            for (x = 0; x < dicemultiple; x++) {
                                var randvar2 = randomint(1, parseInt(numbers[1]));
                                finaltext += randvar2 + " ";
                                displaytext += "(" + randvar2 + ") ";
                                if (x < dicemultiple - 1) {
                                    finaltext += "+ ";
                                }

                            }
                        }

                    }
                    else {
                        finaltext += txtlist[i] + " ";
                        displaytext += txtlist[i] + " ";
                    }

                }

                if (eval(finaltext)) {
                    var dis = displaytext + "\n\nTotal: " + eval(finaltext);




                    if (dis.length < 1990) {
                        if (hasHashtag) {
                            dis = "```" + dis + "```";

                            printtext.replace("$", "");


                            dis += "\n" + printtext + "\n";
                            sendmessageatplayer(dis, message);
                        }
                        else {
                            sendcodemessageatplayer(dis, message);
                        }

                    }
                    else {
                        sendcodemessageatplayer("Wtf too many characters man, try less stuff", message);
                    }
                }

            }

        } //rolling end
        else if (cmd == 'pong') {
            sendcodemessage('dude what the fuck', message);

        }
        else if (cmd == 'syntax' || cmd == 'help' || cmd == 'h') {
            var msg = "**__Bot commands:__**\n" +
                "`!ping` - Pings the bot to check if it's online.\n" +
                //"`!pong` - ...pongs the bot to check if it's online?\n" +
                '`!r` or `!roll` - Rolls dice. Usage examples:  `!r d20`  ,  `!r 2d10+5` ,  `!r 5+3*2 $Test-words`\n' +
                "`!gold help` - Displays gold help menu.\n" +
                "`!h` or `!help` - Displays help menu.\n" +
                "`!l` or `!link` - Link to add bot to server.";
            sendmessage(msg, message);

        }
        else if (cmd == 'easteregg') {
            sendcodemessage('Tell the GM "I found the easter egg!" for inspiration :)', message);

        }

        else if (cmd == 'link' || cmd == "l") {

            sendmessage("**Click on the link to add me to your server!**" +
                "\nhttps://discordapp.com/oauth2/authorize?&client_id=678342914618818577&scope=bot&permissions=8", message);

        }
        else if (cmd == 'purge') {

            let allowedRole = message.guild.roles.find("name", "GMs");
            if (message.member.roles.has(allowedRole.id)) {
                // allowed access to command

                clear(message);
                sendmessageatplayer("Messages purged lol", message);
            } else {
                // not allowed access
                sendmessageatplayer("You're too weak to use this command :(", message);
            }


        }
        else if (cmd == 'gold' || cmd == 'g') {       //Gold stufdf
            if (args[0] == 'set') {   // setgold command selected
                if (!isNaN(args[1])) {
                    setGolddisplay(message, Number(args[1]));
                }
                else {
                    sendmessage("Wrong syntax. Try `!gold help` for a list of commands.", message);
                }
                
            }
            else if (args[0] == 'add') {// addgold command selected
                
                if (!isNaN(args[1])) {
                    addGolddisplay(message, Number(args[1]));
                }
                else {
                    sendmessage("Wrong syntax. Try `!gold help` for a list of commands.", message);
                }
            }
            else if (args[0] == 'remove') {//remove command selected
                if (!isNaN(args[1])) {
                    removeGolddisplay(message, Number(args[1]));
                }
                else {
                    sendmessage("Wrong syntax. Try `!gold help` for a list of commands.", message);
                }
            }
            else if (args[0] == 'help' || args[0] == 'h') {//help command selected
                
                var m = "**__Gold commands:__**\n" +
                    "`!g` or `!gold` shows your gold balance.\n"+
                    "`!g @username` - Checks gold of user.\n" +
                    //"`!pong` - ...pongs the bot to check if it's online?\n" +
                    "`!g add x` - Adds 'x'gp to you.\n" +
                    "`!g remove x` - Removes 'x'gp from you.\n" +
                    "`!g set x` - Set your gold to 'x'gp.\n" +
                    "`!g help` - Displays gold commands.\n";
                sendmessage(m, message);
                
            }
            else if (args[0]) {//check gold of specific player
                if (args[0][0] == '<') {//check gold of specific player
                    var userid = args[0];
                    userid = userid.replace(/[\\<>@#&!]/g, "");

                    checkgolddisplay(message, userid);


                }
                
                
            }
            else {  // just !g
                checkgolddisplay(message, message.author.id);
            }
            
        }
        else if (cmd == 'test') {

            
            
            


        }
    }
})

client.login(auth.token);

var checkIfMention = function (message) {
    var idbool = false;
    var pee = getUserIDfromMessage(message);

    if (pee != "undefined") {
        idbool = true;
    }
    return idbool;
}

var getUserIDfromAt = function (atUser) {

    var at = String(atUser);
    at = at.replace(/[\\<>@#&!]/g, "");
    return at;

}

var getAtfromMessage = function (message) {
    var clientstring = message.mentions.members.first();
    return clientstring;
}

var getUserIDfromMessage = function (message) {
    var id = getUserIDfromAt(getAtfromMessage(message));
    return id;
}


var checkgolddisplay = function (message, userID) {
    
    if (!dataFile[userID]) { //this checks if data for the user has already been created
        sendmessage("User not in database :(", message);
    }

    else {
        var gp = Number(dataFile[userID].Gold);
        var Name = dataFile[userID].Name;
        var q = Name + " has " + gp + "gp.";
        sendmessage(q, message);
    }
}
var addGolddisplay = function (message, x) {
    var userId = message.author.id //user id here
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        dataFile[userId] = { Name: message.author.username, Gold: x, }; //if not, create it
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var disp = "New user to this command, new file created\n\n";
        disp += "Adding " + x + "gp to " + message.author + "...\n\n" +
            "Total gold: " + dataFile[userId].Gold + "gp";
        sendmessage(disp, message);

    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        gp += x;
        dataFile[userId] = { Name: Name, Gold: gp, };
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var q = "Adding " + x + "gp to " + message.author + "...\n\n" +
            "Total gold: " + dataFile[userId].Gold + "gp";
        sendmessage(q, message);

    }

}
var removeGolddisplay = function (message, x) {
    var userId = message.author.id //user id here
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        dataFile[userId] = { Name: message.author.username, Gold: x, }; //if not, create it
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var disp = "New user to this command, new file created\n\n";
        disp += "Can't remove more gold than " + message.author + "has. Setting to 0gp...\n\n" +
            "Total gold: " + dataFile[userId].Gold + "gp";
        sendmessage(disp, message);

    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        if (gp >= x) {
            gp -= x;
            dataFile[userId] = { Name: Name, Gold: gp, };
            fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
            var q = "Removing " + x + "gp from " + message.author + "...\n\n" +
                "Total gold: " + dataFile[userId].Gold + "gp";
            sendmessage(q, message);
        }
        else {
            sendmessage("Can't remove more gold than you have, baka.", message);
        }
        

    }

}

var setGolddisplay = function (message, x) {
    var userId = message.author.id //user id here
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        dataFile[userId] = { Name: message.author.username, Gold: x, }; //if not, create it
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var disp = "New user to this command, new file created.\n\n";
        disp += "Setting " + message.author + "'s gp to " + x + "...\n\n" +
            "Total gold: " + dataFile[userId].Gold + "gp";
        sendmessage(disp, message);
    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        gp = x;
        dataFile[userId] = { Name: Name, Gold: gp, };
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var d = "Setting " + message.author + "'s gp to "+x+"...\n\n" +
            "Total gold: " + dataFile[userId].Gold + "gp";
        sendmessage(d, message);

    }

}

var getGold = function (userId) {
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        console.log("User not in database :(");
    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        var q = Name + " has " + gp + "gp.";
        console.log(q);
        return gp;
    }

}

var addGold = function (userId, x) {
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        var disp = "User does not exist.";
        console.log(disp);
    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        gp += x;
        dataFile[userId] = { Name: Name, Gold: gp, };
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var q = "Adding " + x + "gp to " + message.author + "...\n\n" +
            "Total gold: " + dataFile[userId].Gold + "gp";
        console.log(q);

    }

}

var removeGold = function (userId, x) {
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        var disp = "User does not exist.";
        console.log(disp);
    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        if (gp >= x) {
            gp -= x;
            dataFile[userId] = { Name: Name, Gold: gp, };
            fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
            var q = "Removing " + x + "gp from " + message.author + "...\n\n" +
                "Total gold: " + dataFile[userId].Gold + "gp";
            console.log(q);
        }
        else {
            console.log("Can't remove more gold than you have, baka.");
        }


    }

}

var setGold = function (userId, x) {
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        var disp = "User does not exist.";
        console.log(disp);
    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        gp = x;
        dataFile[userId] = { Name: Name, Gold: gp, };
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var d = "Setting " + message.author + "'s gp to " + x + "...\n\n" +
            "Total gold: " + dataFile[userId].Gold + "gp";
        console.log(d);

    }

}



var randomint = function (x, y) {
    if (x == y) {
        return x;
    }
    else if (y > x) {
        z = Math.abs(y - x);
        q = Math.ceil(Math.random() * (z + 1));

        return q;
    }
    else {
        z = Math.abs(x - y) + 1;
        q = Math.ceil(Math.random() * z + 1) - 1 + y;
        return q;
    }
}

var sendmessage = function (x, message) {

    const channel = message.channel;
    channel.send(x);

}

var sendcodemessage = function (x, message) {

    const channel = message.channel;
    channel.send("```" + x + "```");


}

var sendmessageatplayer = function (x, message) {

    const channel = message.channel;
    var ID = message.author;
    channel.send(ID +"\n"+x);


}
var sendcodemessageatplayer = function (x, message) {

    const channel = message.channel;
    var ID = message.author;
    channel.send( ID  +"\n```" + x + "```");


}
async function clear(message) {
    message.delete();
    const fetched = await message.channel.fetchMessages({ limit: 99 });
    message.channel.bulkDelete(fetched);
}

