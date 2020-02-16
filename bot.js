var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');



// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// Initialize Discord Bot
const bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

var randomint =function(x, y) {
    if (x == y) {
        return x;
    }
    else if (y > x) {
        z = Math.abs(y - x);
        q = Math.ceil(Math.random() * (z + 1));

        return q;
    }
    else {
        z = Math.abs(x - y)+1;
        q = Math.ceil(Math.random() * z+1) - 1 + y;
        return q;
    }
}

var sendmessage = function (x, channelID) {

    bot.sendMessage({
        to: channelID,
        message: x
    },500);

}

var sendcodemessage = function (x, channelID) {

    bot.sendMessage({
        to: channelID,
        message:"```"+ x+"```"
    }, 500);

}
var sendmessageatplayer = function (x, channelID, userID) {

    bot.sendMessage({
        to: channelID,
        message: "<@" + userID + ">\n" + x 
    }, 500);

}
var sendcodemessageatplayer = function (x, channelID, userID) {

    bot.sendMessage({
        to: channelID,
        message: "<@" + userID + ">"+"```" + x + "```"
    }, 500);

}
async function clear() {
    msg.delete();
    const fetched = await msg.channel.fetchMessages({ limit: 99 });
    msg.channel.bulkDelete(fetched);
}

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message,evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        cmd = cmd.toLowerCase();
        args = args.splice(1);

        if (cmd == 'ping') {
            sendcodemessage('pong!', channelID);

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

            for (i = 0; i < args.length; i++) {
                if (args[i].length > 15) {
                    sendcodemessage("Number too big, brain too small :(", channelID);
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
                        sendcodemessage('Invalid syntax, use proper variables. Eg: "!r 2d6"', channelID);
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
                            sendcodemessage("Too many die, I want die x.x", channelID);
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

                        printtext.replace("$","");


                        dis += "\n" + printtext + "\n";
                        sendmessageatplayer(dis, channelID, userID);
                    }
                    else {
                        sendcodemessageatplayer(dis, channelID, userID);
                    }
                    
                }
                else {
                    sendcodemessageatplayer("Wtf too many characters man, try less stuff", channelID, userID);
                }
            }



        } //rolling end
        else if (cmd == 'pong') {
            sendcodemessage('dude what the fuck', channelID);

        }
        else if (cmd == 'syntax' || cmd == 'help' || cmd == 'h') {
            var msg = "**__Bot commands:__**\n" +
                "`!ping` - Pings the bot to check if it's online.\n" +
                "`!pong` - ...pongs the bot to check if it's online?\n" +
                '`!r` or `!roll` - Rolls dice. Usage examples:  `!r d20`  ,  `!r 2d10+5` ,  `!r 5+3*2 $Test-words`\n' +
                "`!h` or `!help` - Displays help menu.\n" +
                "`!l` or `!link` - Link to add bot to server.";
            sendmessage(msg, channelID);

        }
        else if (cmd == 'easteregg') {
            sendcodemessage('Tell the GM "I found the easter egg!" for inspiration :)', channelID);

        }

        else if (cmd == 'link') {

            sendmessage("**Click on the link to add me to your server!**" +
                "\nhttps://discordapp.com/oauth2/authorize?&client_id=678342914618818577&scope=bot&permissions=8", channelID);

        }
        else if (cmd == 'purge' || cmd == "p") {

            

            sendmessageatplayer(bot, channelID, userID);

            //if (message.member.roles.has(allowedRole.id)) {
            //    // allowed access to command
            //    clear();
            //}
            //else {
            //    // not allowed access
            //    sendmessageatplayer("You have no permissions to do this my dude", channelID, userID);
            //}
           
                
        }


    }
});