
const { Client } = require('discord.js');
// Initialize Discord Bot
const client = new Client({ intents: ["Guilds"] });
const { MessageEmbed } = require( "discord.js");
const ytdl = require('ytdl-core');
var servers = {};
var auth = require('./auth.json');
require('dotenv').config();

client.login(auth.token).then(() => {
    console.log(`\nLogged in as ${client.user.username} at:\n ${new Date(Date.now())}!\n`);
    client.user.setActivity(" with tiddies", { type: 'PLAYING' });
})

//File save system
const fs = require('fs') //importing file save
var dataPath = "./playerdata.json";
var dataRead = fs.readFileSync(dataPath);
var dataFile = JSON.parse(dataRead); //ready for use

var listPath = "./listdata.json";
var listRead = fs.readFileSync(listPath);
var listFile = JSON.parse(listRead); //ready for use
var isPlaying = false;


setInterval(function () {
    if (!isPlaying) {
        client.destroy().then(() => {
            client.login(auth.token);
            console.log(`\nLogged in as ${client.user.username} at:\n ${new Date(Date.now())}!\n`);
            client.user.setActivity(" with tiddies", { type: 'PLAYING' });
        });
    }
    else {
        console.log(`\nDid not relog because bot was playing music.\n`);
    }
    
}, 1800000);

client.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.on('shardError', error => {
    console.error('A websocket connection encountered an error:', error);
});

client.on('ready', () => {
    console.log(`Client ready!`);
})
client.on('reconnecting', message => {;
    console.log(`User Reconnecting at:\n ${new Date(Date.now())}!`);
});
client.on('disconnect', message => {
    console.log(`User Disconnected at:\n ${new Date(Date.now())}!`);
    client.destroy().then(() => client.login(auth.token));
});
client.on('resume', message => {
    console.log(`Resumed Connection ${client.user.tag} at:\n ${new Date(Date.now())}!`);
});
client.on('messageUpdate', (oldMessage, newMessage) => {
    const messageauth = oldMessage.author;
    if (messageauth != "<@261302296103747584>") {
        if (oldMessage.channel.name === 'character-transaction-log' || oldMessage.channel.name === 'gold-transaction-log') {
            const sendtochannel = oldMessage.guild.channels.find(ch => ch.name === 'character-log-archive');
            sendtochannel.send("**__Message edited from:__\n**  " + oldMessage.content + " \n\n__**To:**__\n " + newMessage.content + " \n\n _This message was edited by " + newMessage.author.username + " in <#" + newMessage.channel.id + ">_\n\n` `");
        }
    }
})

//When Message in server
client.on('message', message => {
        // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`

    const sendtochannel = message.guild.channels.find(ch => ch.name === 'character-log-archive');
    const messageauth = message.author;
    if (messageauth != "<@261302296103747584>") {
        // && messageauth!="<@261302296103747584>"
        if (message.channel.name === 'character-transaction-log' || message.channel.name === 'gold-transaction-log') {
            sendtochannel.send("**__Message logged:__**\n" + message.content + "\n\n _This message was sent by " + message.author.username + " in <#" + message.channel.id + ">_\n\n` `");
        }
    }
    if (message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
        cmd = cmd.toLowerCase();
        args = args.splice(1);

        if (cmd == 'ping') {
            sendcodemessage('pong!', message);
            return;
        }
        else if (cmd == 'play' || cmd == 'p') {

            function play(connection, message) {
                var server = servers[message.guild.id];
                server.dispatcher = connection.playStream(ytdl(server.queue[0], { filter: "audioonly" }));

                server.queue.shift();
                server.dispatcher.on("end", function () {
                    if (server.queue[0]) {
                        sendcodemessage("Playing Song:",message);
                        sendmessage(server.queue[0], message);
                        play(connection, message);
                    }
                    else {
                        if (message.guild.voiceConnection) {
                            sendcodemessage("Disconnecting due to empty queue", message);
                            message.guild.voiceConnection.disconnect();
                            isPlaying = false;
                        }
                        connection.disconnect();
                    }
                });
            }

            if (args[0] == null) {
                sendcodemessage('What the fuck do you want me to play? You have to type that in, dipshit.', message);
                return;
            }
            else {
                if (!message.member.voiceChannel) {
                    sendcodemessage("You're not in a fucking voice channel, dipshit.", message);
                    return;
                }
                else {
                    isPlaying = true;
                    if (!servers[message.guild.id]) servers[message.guild.id] = {
                        queue: []
                    }
                    var server = servers[message.guild.id];

                    sendcodemessage('Added song to Queue.', message);
                    server.queue.push(args[0]);

                    if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function (connection) {
                        sendcodemessage("Playing Song:", message);
                        sendmessage(server.queue[0], message);
                        play(connection, message);
                    })

                }
            }
            return;
        }
        else if (cmd == 'skip') {
            var server = servers[message.guild.id];
            if (server.dispatcher) {
                sendcodemessage('Skipping Song...', message);
                server.dispatcher.end();
            }

        }
        else if (cmd == 'stop') {
            var server = servers[message.guild.id];
            if (message.guild.voiceConnection) {
                for (var i = server.queue.length - 1; i >= 0; i--) {
                    server.queue.splice(i, 1);
                }
                server.dispatcher.end();
                sendcodemessage("Stopped the queue.", message);
            }
            if (message.guild.voiceConnection) {
                sendcodemessage("Disconnecting", message);
                message.guild.voiceConnection.disconnect();
                isPlaying = false;
            }
        }

        else if (cmd == 'br') {

            sendmessage('``` ```', message);
            clear(message);
            return;
        }

        else if (cmd == 'r' || cmd == 'roll') { //If rolling

            rolldicedisplay(message, args);
            return;

        } //rolling end
        else if (cmd == 'pong') {
            sendcodemessage('dude what the fuck', message);
            return;

        }
        else if (cmd == 'syntax' || cmd == 'help' || cmd == 'h') {
            
            var msg = "**__Bot commands:__**\n" +
                "`!ping` - Pings the bot to check if it's online.\n" +
                "`!pong` - ...pongs the bot to check if it's online?\n" +
                '`!r` or `!roll` - Rolls dice. Usage examples:  `!r d20`  ,  `!r 2d10+5` ,  `!r 5+3*2 $Test-words`\n' +
                '`!e x` or `!explore x` - Do exploration. Replace x with number of days, 1-5.\n' +
                "`!gold help` - Displays gold help menu.\n" +
                "`!h` or `!help` - Displays help menu.\n" +
                "`!ns` - Generates new shop. (Admin Only)\n" +
                "`!l` or `!link` - Link to add bot to server.";
            sendmessage(msg, message);
            return;

        }
        

        else if (cmd == 'easteregg') {
            sendcodemessage('Tell the GM "I found the easter egg!" for inspiration :)', message);
            return;
        }

        else if (cmd == 'link' || cmd == "l") {

            sendmessage("**Click on the link to add me to your server!**" +
                "\nhttps://discordapp.com/oauth2/authorize?&client_id=678342914618818577&scope=bot&permissions=8", message);
            return;
        }
        else if (cmd == 'purge') {

            let allowedRole = message.guild.roles.find("name", "noobs lmao");
            if (allowedRole != null) {
                if (message.member.roles.has(allowedRole.id)) {
                    // allowed access to command
                    clear(message);
                } else {
                    // not allowed access
                    sendmessageatplayer("You're too weak to use this command :(", message);
                }
            }
            return;

        }
        else if (cmd == 'gold' || cmd == 'g') {       //Gold stufdf
            if (args[0] == 'set') {   // setgold command selected
                if (!isNaN(args[1])) {
                    if (args[2] != null) {
                        if (args[2][0] == '<') {//check gold of specific player
                            var userid = args[2];
                            userid = userid.replace(/[\\<>@#&!]/g, "");
                            setGolddisplayUser(message, Number(args[1]), userid);
                        }
                    }
                    else {
                        setGolddisplayUser(message, Number(args[1]), message.author.id);
                    }
                }
                else {
                    sendmessage("Wrong syntax. Try `!gold help` for a list of commands.", message);
                }

            }
            else if (args[0] == 'add') {// addgold command selected

                if (!isNaN(args[1])) {
                    if (args[2] != null) {
                        if (args[2][0] == '<') {//check gold of specific player
                            var userid = args[2];
                            userid = userid.replace(/[\\<>@#&!]/g, "");
                            addGolddisplayUser(message, Number(args[1]), userid);
                        }
                    }
                    else {
                        addGolddisplayUser(message, Number(args[1]),message.author.id);
                    }
                }
                else {
                    sendmessage("Wrong syntax. Try `!gold help` for a list of commands.", message);
                }
            }
            else if (args[0] == 'remove') {//remove command selected
                if (!isNaN(args[1])) {
                    if (args[2] != null) {
                        if (args[2][0] == '<') {//check gold of specific player
                            var userid = args[2];
                            userid = userid.replace(/[\\<>@#&!]/g, "");
                            removeGolddisplayUser(message, Number(args[1]), userid);
                        }
                    }
                    else {
                        removeGolddisplayUser(message, Number(args[1]), message.author.id);
                    }
                }
                else {
                    sendmessage("Wrong syntax. Try `!gold help` for a list of commands.", message);
                }
            }
            else if (args[0] == 'help' || args[0] == 'h') {//help command selected

                var m = "**__Gold commands:__**\n" +
                    "`!g` or `!gold` shows your gold balance.\n" +
                    "`!g @username` - Checks gold of user.\n" +
                    //"`!pong` - ...pongs the bot to check if it's online?\n" +
                    "`!g add x` - Adds 'x'gp to you.\n" +
                    "`!g remove x` - Removes 'x'gp from you.\n" +
                    "`!g set x` - Set your gold to 'x'gp.\n" +
                    "`!g help` - Displays gold commands.\n" +
                    "`Append @username to any command to use it on a specific user.`\n";
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
            return;
        }
            // NEWSHOP
        else if (cmd == 'newshop' || cmd == 'ns') {

            var ShopText = "";
            var ShopItems = [];
            var table = listFile["ShopTable"];

            //ShopText += "_Generating New Shop..._\n\n";
            ShopText += "_Generating New Shop..._\n\n";

            //--------------------------Common Table Calculation Code--------------------------
            var CommonItemList = [];
            var CommonNo = rolldice(table.CommonTimes);
            ShopText += "__**Common Magic Items**__\n";
            //Rolling on common table
            for (k = 0; k < CommonNo; k++) {
                var tempitem = generateCommonShopItem();
                CommonItemList.push(tempitem);
            }
            //Sorting CommonItemList
            var List1 = [];
            var timesList = [];
            for (k = 0; k < CommonItemList.length; k++) {
                if (!List1.includes(CommonItemList[k])) {
                    List1.push(CommonItemList[k]);
                    timesList.push(1);
                }
                else {
                    timesList[List1.indexOf(CommonItemList[k])] = timesList[List1.indexOf(CommonItemList[k])] + 1;
                }
            }
            var potionList = [];
            var potionTimesList = [];
            var potionPriceList = [];
            var scrollList = [];
            var scrollTimesList = [];
            var scrollPriceList = [];
            var consumableList = [];
            var consumableTimesList = [];
            var consumablePriceList = [];
            var itemList = [];
            var itemTimesList = [];
            var itemPriceList = [];

            // Sorting items into lists
            for (h = 0; h < List1.length; h++) {
                var newnewprice = rolldice(table.CommonPrice);
                if (List1[h].includes("Potion of Healing")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    potionList.unshift(List1[h]);
                    potionTimesList.unshift(timesList[h]);
                    potionPriceList.unshift(newnewprice);
                }
                else if (List1[h].includes("Potion")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    potionList.push(List1[h]);
                    potionTimesList.push(timesList[h]);
                    potionPriceList.push(newnewprice);
                }
                else if (List1[h].includes("Scroll of")) {
                    newnewprice = Math.ceil((newnewprice) / 2);
                    scrollList.push(List1[h]);
                    scrollTimesList.push(timesList[h]);
                    scrollPriceList.push(newnewprice);
                }
                else if (listFile["CommonConsumables"].Rewards.includes(List1[h])) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    consumableList.push(List1[h]);
                    consumableTimesList.push(timesList[h]);
                    consumablePriceList.push(newnewprice);
                }
                else
                {
                    itemList.push(List1[h]);
                    itemTimesList.push(timesList[h]);
                    itemPriceList.push(newnewprice);
                }
            }

            // Add items to shoptext in order

            if (potionList.length + scrollList.length + consumableList.length > 0) {
                ShopText += "___Consumables___\n"
                for (var i = 0; i < potionList.length; i++) {
                    ShopText += "_" + potionTimesList[i] + "x_\t" + potionList[i] + "\t" + "_" + potionPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < scrollList.length; i++) {
                    ShopText += "_" + scrollTimesList[i] + "x_\t" + scrollList[i] + "\t" + "_" + scrollPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < consumableList.length; i++) {
                    ShopText += "_" + consumableTimesList[i] + "x_\t" + consumableList[i] + "\t" + "_" + consumablePriceList[i] + "gp_\n";
                }
            }

            if (itemList.length > 0) {
                ShopText += "___Items___\n"
                for (var i = 0; i < itemList.length; i++) {
                    ShopText += "_" + itemTimesList[i] + "x_\t" + itemList[i] + "\t" + "_" + itemPriceList[i] + "gp_\n";
                }
            }
            
            //-------------------COMMON END---------------------
            ShopText += "\n"
            //--------------------------Uncommon Table Calculation Code--------------------------
            var UncommonItemList = [];
            var UncommonNo = rolldice(table.UncommonTimes);
            ShopText += "__**Uncommon Magic Items**__\n";
            //Rolling on uncommon table
            for (k = 0; k < UncommonNo; k++) {
                var tempitem = table.Uncommon[rolldice("1d" + (table.Uncommon.length)) - 1];

                if (tempitem == "Spellscroll2") {
                    tempitem = "Scroll of " + RollScrollPotFromName("ScrollTable2");
                }
                else if (tempitem == "Spellscroll3") {
                    tempitem = "Scroll of " + RollScrollPotFromName("ScrollTable3");
                }
                else if (tempitem == "UncommonItem") {
                    tempitem = RollScrollPotFromName("UncommonItems");
                }


                if (tempitem == "Potion of Resistance") {
                    tempitem = "Potion of " + RollScrollPotFromName("ResistanceTable");
                }
                if (tempitem == "Elemental Gem") {
                    tempitem = RollScrollPotFromName("ElementalGem");
                }
                if (tempitem == "Instrument of the Bards") {
                    tempitem = RollScrollPotFromName("BardInstrumentUncommon")
                }
                UncommonItemList.push(tempitem);
            }
            //Sorting UncommonItemlist
            var List1 = [];
            var timesList = [];
            for (k = 0; k < UncommonItemList.length; k++) {
                if (!List1.includes(UncommonItemList[k])) {
                    List1.push(UncommonItemList[k]);
                    timesList.push(1);
                }
                else {
                    timesList[List1.indexOf(UncommonItemList[k])] = timesList[List1.indexOf(UncommonItemList[k])] + 1;
                }
            }
            var potionList = [];
            var potionTimesList = [];
            var potionPriceList = [];
            var scrollList = [];
            var scrollTimesList = [];
            var scrollPriceList = [];
            var consumableList = [];
            var consumableTimesList = [];
            var consumablePriceList = [];
            var itemList = [];
            var itemTimesList = [];
            var itemPriceList = [];

            // Sorting items into lists
            for (h = 0; h < List1.length; h++) {
                var newnewprice = rolldice(table.UncommonPrice);
                if (List1[h].includes("Potion of Greater Healing")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    potionList.unshift(List1[h]);
                    potionTimesList.unshift(timesList[h]);
                    potionPriceList.unshift(newnewprice);
                }
                else if (List1[h].includes("Potion")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    potionList.push(List1[h]);
                    potionTimesList.push(timesList[h]);
                    potionPriceList.push(newnewprice);
                }
                else if (List1[h].includes("Scroll of")) {
                    newnewprice = Math.ceil((newnewprice) / 2);
                    scrollList.push(List1[h]);
                    scrollTimesList.push(timesList[h]);
                    scrollPriceList.push(newnewprice);
                }
                else if (listFile["UncommonConsumables"].Rewards.includes(List1[h]) || List1[h].includes("Elemental Gem")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    consumableList.push(List1[h]);
                    consumableTimesList.push(timesList[h]);
                    consumablePriceList.push(newnewprice);
                }
                else {
                    itemList.push(List1[h]);
                    itemTimesList.push(timesList[h]);
                    itemPriceList.push(newnewprice);
                }
            }

            // Add items to shoptext in order

            if (potionList.length + scrollList.length + consumableList.length > 0) {
                ShopText += "___Consumables___\n"
                for (var i = 0; i < potionList.length; i++) {
                    ShopText += "_" + potionTimesList[i] + "x_\t" + potionList[i] + "\t" + "_" + potionPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < scrollList.length; i++) {
                    ShopText += "_" + scrollTimesList[i] + "x_\t" + scrollList[i] + "\t" + "_" + scrollPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < consumableList.length; i++) {
                    ShopText += "_" + consumableTimesList[i] + "x_\t" + consumableList[i] + "\t" + "_" + consumablePriceList[i] + "gp_\n";
                }
            }

            if (itemList.length > 0) {
                ShopText += "___Items___\n"
                for (var i = 0; i < itemList.length; i++) {
                    ShopText += "_" + itemTimesList[i] + "x_\t" + itemList[i] + "\t" + "_" + itemPriceList[i] + "gp_\n";
                }
            }
            
            //-------------------Uncommon END---------------------
            ShopText += "\n"
            //--------------------------Rare Table Calculation Code--------------------------
            var RareItemList = [];
            var RareNo = rolldice(table.RareTimes);
            ShopText += "__**Rare Magic Items**__\n";
            //Rolling on Rare table
            for (k = 0; k < RareNo; k++) {
                var tempitem = generateRareShopItem();
                RareItemList.push(tempitem);
            }
            //Sorting RareItemList
            var List1 = [];
            var timesList = [];
            for (k = 0; k < RareItemList.length; k++) {
                if (!List1.includes(RareItemList[k])) {
                    List1.push(RareItemList[k]);
                    timesList.push(1);
                }
                else {
                    timesList[List1.indexOf(RareItemList[k])] = timesList[List1.indexOf(RareItemList[k])] + 1;
                }
            }
            var potionList = [];
            var potionTimesList = [];
            var potionPriceList = [];
            var scrollList = [];
            var scrollTimesList = [];
            var scrollPriceList = [];
            var consumableList = [];
            var consumableTimesList = [];
            var consumablePriceList = [];
            var itemList = [];
            var itemTimesList = [];
            var itemPriceList = [];

            // Sorting items into lists
            for (h = 0; h < List1.length; h++) {
                var newnewprice = rolldice(table.RarePrice);
                if (List1[h].includes("Potion of Greater Healing")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    potionList.unshift(List1[h]);
                    potionTimesList.unshift(timesList[h]);
                    potionPriceList.unshift(newnewprice);
                }
                else if (List1[h].includes("Potion")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    potionList.push(List1[h]);
                    potionTimesList.push(timesList[h]);
                    potionPriceList.push(newnewprice);
                }
                else if (List1[h].includes("Scroll of")) {
                    newnewprice = Math.ceil((newnewprice) / 2);
                    scrollList.push(List1[h]);
                    scrollTimesList.push(timesList[h]);
                    scrollPriceList.push(newnewprice);
                }
                else if (listFile["RareConsumables"].Rewards.includes(List1[h]) || List1[h].includes("Feather Token")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    consumableList.push(List1[h]);
                    consumableTimesList.push(timesList[h]);
                    consumablePriceList.push(newnewprice);
                }
                else {
                    itemList.push(List1[h]);
                    itemTimesList.push(timesList[h]);
                    itemPriceList.push(newnewprice);
                }
            }

            // Add items to shoptext in order

            if (potionList.length + scrollList.length + consumableList.length > 0) {
                ShopText += "___Consumables___\n"
                for (var i = 0; i < potionList.length; i++) {
                    ShopText += "_" + potionTimesList[i] + "x_\t" + potionList[i] + "\t" + "_" + potionPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < scrollList.length; i++) {
                    ShopText += "_" + scrollTimesList[i] + "x_\t" + scrollList[i] + "\t" + "_" + scrollPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < consumableList.length; i++) {
                    ShopText += "_" + consumableTimesList[i] + "x_\t" + consumableList[i] + "\t" + "_" + consumablePriceList[i] + "gp_\n";
                }
            }

            if (itemList.length > 0) {
                ShopText += "___Items___\n"
                for (var i = 0; i < itemList.length; i++) {
                    ShopText += "_" + itemTimesList[i] + "x_\t" + itemList[i] + "\t" + "_" + itemPriceList[i] + "gp_\n";
                }
            }
            
            //-------------------RARE END---------------------
            ShopText += "\n"
            //--------------------------VRare Table Calculation Code--------------------------
            var VRareItemList = [];
            var VRareNo = rolldice(table.VRareTimes);
            ShopText += "__**Very Rare Magic Items**__\n";
            //Rolling on Rare table
            for (k = 0; k < VRareNo; k++) {
                var tempitem = generateVRareShopItem();
                VRareItemList.push(tempitem);
            }
            //Sorting VRareItemList
            var List1 = [];
            var timesList = [];
            for (k = 0; k < VRareItemList.length; k++) {
                if (!List1.includes(VRareItemList[k])) {
                    List1.push(VRareItemList[k]);
                    timesList.push(1);
                }
                else {
                    timesList[List1.indexOf(VRareItemList[k])] = timesList[List1.indexOf(VRareItemList[k])] + 1;
                }
            }
            var potionList = [];
            var potionTimesList = [];
            var potionPriceList = [];
            var scrollList = [];
            var scrollTimesList = [];
            var scrollPriceList = [];
            var consumableList = [];
            var consumableTimesList = [];
            var consumablePriceList = [];
            var itemList = [];
            var itemTimesList = [];
            var itemPriceList = [];

            // Sorting items into lists
            for (h = 0; h < List1.length; h++) {
                var newnewprice = rolldice(table.VRarePrice);
                if (List1[h].includes("Potion of Supreme Healing")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    potionList.unshift(List1[h]);
                    potionTimesList.unshift(timesList[h]);
                    potionPriceList.unshift(newnewprice);
                }
                else if (List1[h].includes("Potion")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    potionList.push(List1[h]);
                    potionTimesList.push(timesList[h]);
                    potionPriceList.push(newnewprice);
                }
                else if (List1[h].includes("Scroll of")) {
                    newnewprice = Math.ceil((newnewprice) / 2);
                    scrollList.push(List1[h]);
                    scrollTimesList.push(timesList[h]);
                    scrollPriceList.push(newnewprice);
                }
                else if (listFile["VRareConsumables"].Rewards.includes(List1[h])) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    consumableList.push(List1[h]);
                    consumableTimesList.push(timesList[h]);
                    consumablePriceList.push(newnewprice);
                }
                else {
                    itemList.push(List1[h]);
                    itemTimesList.push(timesList[h]);
                    itemPriceList.push(newnewprice);
                }
            }

            // Add items to shoptext in order

            if (potionList.length + scrollList.length + consumableList.length > 0) {
                ShopText += "___Consumables___\n"
                for (var i = 0; i < potionList.length; i++) {
                    ShopText += "_" + potionTimesList[i] + "x_\t" + potionList[i] + "\t" + "_" + potionPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < scrollList.length; i++) {
                    ShopText += "_" + scrollTimesList[i] + "x_\t" + scrollList[i] + "\t" + "_" + scrollPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < consumableList.length; i++) {
                    ShopText += "_" + consumableTimesList[i] + "x_\t" + consumableList[i] + "\t" + "_" + consumablePriceList[i] + "gp_\n";
                }
            }

            if (itemList.length > 0) {
                ShopText += "___Items___\n"
                for (var i = 0; i < itemList.length; i++) {
                    ShopText += "_" + itemTimesList[i] + "x_\t" + itemList[i] + "\t" + "_" + itemPriceList[i] + "gp_\n";
                }
            }

            //-------------------VRARE END---------------------

            ShopText += "\n"
            //--------------------------Legendary Table Calculation Code--------------------------
            var LegendaryItemList = [];
            var LegendaryNo = rolldice(table.LegendaryTimes);
            if (LegendaryNo != undefined) {
                ShopText += "__**Legendary Magic Item**__\n";
            }
            else {
                ShopText += "_No Legendary Magic Item this week :(_\n\n";
            }
            //Rolling on Legendary table
            for (k = 0; k < LegendaryNo; k++) {
                var tempitem = generateLegendaryShopItem();
                
                LegendaryItemList.push(tempitem);
            }
            //Sorting LegendaryItemList
            var List1 = [];
            var timesList = [];
            for (k = 0; k < LegendaryItemList.length; k++) {
                if (!List1.includes(LegendaryItemList[k])) {
                    List1.push(LegendaryItemList[k]);
                    timesList.push(1);
                }
                else {
                    timesList[List1.indexOf(LegendaryItemList[k])] = timesList[List1.indexOf(LegendaryItemList[k])] + 1;
                }
            }
            var potionList = [];
            var potionTimesList = [];
            var potionPriceList = [];
            var scrollList = [];
            var scrollTimesList = [];
            var scrollPriceList = [];
            var consumableList = [];
            var consumableTimesList = [];
            var consumablePriceList = [];
            var itemList = [];
            var itemTimesList = [];
            var itemPriceList = [];

            // Sorting items into lists
            for (h = 0; h < List1.length; h++) {
                var newnewprice = rolldice(table.LegendaryPrice);
                if (List1[h].includes("Potion")) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    potionList.push(List1[h]);
                    potionTimesList.push(timesList[h]);
                    potionPriceList.push(newnewprice);
                }
                else if (List1[h].includes("Scroll of")) {
                    newnewprice = Math.ceil((newnewprice) / 2);
                    scrollList.push(List1[h]);
                    scrollTimesList.push(timesList[h]);
                    scrollPriceList.push(newnewprice);
                }
                else if (listFile["LegendaryConsumables"].Rewards.includes(List1[h])) {
                    newnewprice = Math.ceil((2 * newnewprice) / 3);
                    consumableList.push(List1[h]);
                    consumableTimesList.push(timesList[h]);
                    consumablePriceList.push(newnewprice);
                }
                else {
                    itemList.push(List1[h]);
                    itemTimesList.push(timesList[h]);
                    itemPriceList.push(newnewprice);
                }
            }

            // Add items to shoptext in order

            if (potionList.length + scrollList.length + consumableList.length > 0) {
                ShopText += "___Consumables___\n"
                for (var i = 0; i < potionList.length; i++) {
                    ShopText += "_" + potionTimesList[i] + "x_\t" + potionList[i] + "\t" + "_" + potionPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < scrollList.length; i++) {
                    ShopText += "_" + scrollTimesList[i] + "x_\t" + scrollList[i] + "\t" + "_" + scrollPriceList[i] + "gp_\n";
                }
                for (var i = 0; i < consumableList.length; i++) {
                    ShopText += "_" + consumableTimesList[i] + "x_\t" + consumableList[i] + "\t" + "_" + consumablePriceList[i] + "gp_\n";
                }
            }

            if (itemList.length > 0) {
                ShopText += "___Items___\n"
                for (var i = 0; i < itemList.length; i++) {
                    ShopText += "_" + itemTimesList[i] + "x_\t" + itemList[i] + "\t" + "_" + itemPriceList[i] + "gp_\n";
                }
            }
            
            //-------------------Legendary END---------------------

            //Push final Message
            sendmessage(ShopText, message);
        }

        else if (cmd == 'explore' || cmd == 'e') {

            roll = randomint(1, 100);

            if (args[1]) {
                roll = Number(args[1]);
            }
            if (roll > 100) {
                roll = 100;
            }
            else if (roll < 1) {
                roll = 1;
            }

            verb = "a";
            tens = Math.floor(roll / 10);

            if (tens == 8 || roll == 11 || roll == 18) {
                verb = "an";
            }

            disptext = "Rolling a d100...\n\n" +
                "Rolled " + verb + " (" + roll + ").";

            noofdays = args[0];

            if (!args[0]) {
                sendmessage("Plese type in number of exploration days.", message);
                return;
            }
            else if (isNaN(noofdays)) //if is not a number
            {
                sendmessage("Wrong syntax. Try `!explore 1`", message);
                return;
            }
            else if (noofdays > 5 || noofdays <= 0) {//if number is too big or negative
                sendmessage("Number of days cannot exceed 5 or be smaller than 1.", message);
                return;
            }
            else {
                table = listFile["LootTable" + noofdays];
                var tier = getTier(table.Range,roll);
                
                disptext += "\n\nPulling from " + table.Name + " table, tier " + (tier + 1) + ".\n\n";

                var copperamt = rolldice(table.Copper[tier]);
                var silveramt = rolldice(table.Silver[tier]);
                var goldamt = rolldice(table.Gold[tier]);
                var platinumamt = rolldice(table.Platinum[tier]);

                disptext += "You have found:\n";

                var rewardstext = "";
                var plat = 0;
                var gold = 0;
                var silv = 0;
                var copp = 0;

                if (platinumamt != undefined) {
                    rewardstext += platinumamt + " platinum pieces\n";
                    plat = Number(platinumamt);
                }
                
                if (goldamt != undefined) {
                    rewardstext += goldamt + " gold pieces\n";
                    gold = Number(goldamt);
                }
                if (silveramt != undefined) {
                    rewardstext += silveramt + " silver pieces\n";
                    silv = Number(silveramt);
                }
                if (copperamt != undefined) {
                    rewardstext += copperamt + " copper pieces\n";
                    copp = Number(copperamt);
                }

                if (rewardstext == "") {
                    rewardstext = "Absolutely nothing :(\n";
                }
                else {
                    rewardstext += "\nTotal gold value: \n";
                    moneylist = convertToGold(plat, gold, silv, copp);
                    gold = moneylist[0];
                    silv = moneylist[1];
                    copp = moneylist[2];
                    
                    if (gold != 0) {
                        rewardstext += gold + " gold\n";
                    }
                    if (silv != 0) {
                        rewardstext += silv + " silver\n";
                        
                    }
                    if (copp !=0) {
                        rewardstext += copp + " copper\n\n";
                    }
                        
                }

                if (table.MagicTables[tier] != 0) {
                    // explore
                    rewardstext += "---------------------------------------\n";
                    var RolledTables = table.MagicTables[tier];
                    var RolledTimes = table.MagicTimes[tier];
                    var MagicTable;

                    RolledTables = RolledTables.split(",");
                    RolledTimes = RolledTimes.split(",");
                    var MagicRewards = [];
                    var FilterList = [];
                    var FilterNumber = [];

                    for (k = 0; k < RolledTables.length; k++) {
                        var TableToRollOn = RolledTables[k];
                        noOfTimes = rolldice(RolledTimes[k]);
                        if (TableToRollOn == "X" || TableToRollOn == "Y" || TableToRollOn == "Z") {
                            rewardstext += "Rolling on Injury table " + TableToRollOn + ", " + "(" + noOfTimes + ") " + RolledTimes[k] + " time(s).\n";
                        }
                        else {
                            rewardstext += "Rolling on Magic table " + TableToRollOn + ", " + "(" + noOfTimes + ") " + RolledTimes[k] + " time(s).\n";
                        }
                       
                        MagicTable = "MagicTable" + TableToRollOn;

                        for (s = 0; s < noOfTimes; s++) {
                            RolledItem = RollTableFromName(MagicTable);
                            if (RolledItem != undefined) {
                                if (RolledItem.startsWith("Potion") && !isNaN(RolledItem[RolledItem.length - 1])) {
                                    potTier = RolledItem[RolledItem.length - 1];
                                    potlist = "PotionTable" + potTier;
                                    RolledItem = "Potion of " + RollScrollPotFromName(potlist);

                                    if (RolledItem == "Potion of Resistance") {
                                        RolledItem = "Potion of " + RollScrollPotFromName("ResistanceTable");
                                    }
                                }
                                else if (RolledItem.startsWith("Scroll") && !isNaN(RolledItem[RolledItem.length - 1])) {
                                    scrollTier = RolledItem[RolledItem.length - 1];
                                    scrolllist = "ScrollTable" + scrollTier;
                                    RolledItem = "Scroll of " + RollScrollPotFromName(scrolllist);
                                }
                                else if (RolledItem.startsWith("MagicConsumables") && !isNaN(RolledItem[RolledItem.length - 1])) {
                                    ItemTier = RolledItem[RolledItem.length - 1];
                                    if (ItemTier == "0") {
                                        RolledItem = RollScrollPotFromName("CommonConsumables");
                                    }
                                    else if (ItemTier == "1") {
                                        RolledItem = RollScrollPotFromName("UncommonConsumables");
                                        if (RolledItem == "Elemental Gem") {
                                            RolledItem = RollScrollPotFromName("ElementalGem");
                                        }
                                    }
                                    else if (ItemTier == "2") {
                                        RolledItem = RollScrollPotFromName("RareConsumables");
                                    }
                                    else if (ItemTier == "3") {
                                        RolledItem = RollScrollPotFromName("VRareConsumables");
                                    }
                                    else if (ItemTier == "4") {
                                        RolledItem = RollScrollPotFromName("LegendaryConsumables");
                                    }
                                }
                                else if (RolledItem.startsWith("MagicItem") && !isNaN(RolledItem[RolledItem.length - 1])) {
                                    ItemTier = RolledItem[RolledItem.length - 1];
                                    if (ItemTier == "0") {
                                        RolledItem = generateCommonItem();
                                    }
                                    else if (ItemTier == "1") {
                                        RolledItem = generateUncommonItem();
                                    }
                                    else if (ItemTier == "2") {
                                        RolledItem = generateRareItem();
                                    }
                                    else if (ItemTier == "3") {
                                        RolledItem = generateVRareItem();
                                    }
                                    else if (ItemTier == "4") {
                                        RolledItem = RolledItem = generateVRareItem();
                                    }
                                    else if (RolledItem.startsWith("SpellwroughtTattoo") && !isNaN(RolledItem[RolledItem.length - 1])) {
                                        TattooTier = RolledItem[RolledItem.length - 1];
                                        scrolllist = "ScrollTable" + TattooTier;
                                        RolledItem = "Spellwrought Tattoo (" + RollScrollPotFromName(scrolllist)+")";
                                    }
                                }
                                MagicRewards.push(RolledItem);
                            }


                        }

                    }
                    for (h = 0; h < MagicRewards.length; h++) {
                        if (!FilterList.includes(MagicRewards[h])) {
                            FilterList.push(MagicRewards[h]);
                            FilterNumber.push(1);
                        }
                        else {
                            FilterNumber[FilterList.indexOf(MagicRewards[h])] = FilterNumber[FilterList.indexOf(MagicRewards[h])] + 1;
                        }


                    }
                    var finalRewards = "";
                    for (nn = 0; nn < FilterList.length; nn++) {
                        finalRewards += FilterList[nn] + " x" + FilterNumber[nn]+"\n";
                    }


                    rewardstext += "\n";

                    rewardstext += finalRewards;
                }


                disptext += rewardstext;

            }

            sendcodemessageatplayer(disptext, message);
            return;
        }

        else if (cmd == 'test' || cmd == 't') {       //Testing
            //sendmessage("No test case currently implemented", message);
            sendmessage("```"+message.content+"```", message);

            return;
        }
    }
})



var RollScrollPot = function (Table) {
    return Table.Rewards[randomint(1, Table.Rewards.length)-1];
}
var RollScrollPotFromName = function (TableName) {
    var tab = listFile[TableName];
    return RollScrollPot(tab);
}

var RollTable = function (Table) {

    rolledN = randomint(1, 100);


    var MTier = getTier(Table.Range, rolledN);

    return Table.Rewards[MTier];


}

var RollTableFromName = function (TableName) {
    TableToRoll = listFile[TableName];
    
    rolledN = randomint(1, 100);


    var MTier = getTier(TableToRoll.Range, rolledN);

    return TableToRoll.Rewards[MTier];

    
}

var getTier = function (rangelist, number) {
    var t = 0;
    for (i = 0; i < rangelist.length; i++) {
        if (number > rangelist[i]) {
            t = i + 1;
        }
    }
    return t;
}


var rolldice = function (text) {

    args = String(text).split(' ');
    
    args = args.splice(0);

    var parsetxt = "";
    var hasHashtag = false;
    var printtext = "";
    var finaltext = "";
    var number = "";
    var displaytext = "";

    var operator = "";
    var txtlist = [];

    if (!args[0]) {
        return;

    }
    else {
        for (i = 0; i < args.length; i++) {
            if (args[i].length > 15) {
                return;
            }
            else {
                hasHashtag = false;
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
                finaltext += "(";
                var numbers = txtlist[i].split("d");

                if (!numbers[0]) {
                    var randvar = randomint(1, parseInt(numbers[1]));
                    finaltext += randvar + " ";
                    displaytext += "(" + randvar + ") ";
                }
                else {
                    var dicemultiple = parseInt(numbers[0]);
                    if (dicemultiple > 400) {
                        
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
                finaltext += ")";

            }
            else {
                finaltext += txtlist[i] + " ";
                displaytext += txtlist[i] + " ";
            }

        }

        if (eval(finaltext)) {
            return eval(finaltext);

        }

    }
}

var rolldicedisplay = function (message, args) {
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
        startRecording = false;
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
                else if (args[i][o] != "$"){
                    printtext += args[i][o];
                }
                
            }
            if (hasHashtag) {
                if (!startRecording ) {
                    startRecording = true;
                }
                if (startRecording) {
                    printtext += " ";
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
                finaltext += "(";
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
                finaltext += ")";

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

                    dis += "\n **" + printtext + "**\n";
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
}

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
        sendmessage("User does not exist, use the `!gold add 0` to create user.", message);
    }
    else {
        var gp = Number(dataFile[userID].Gold);
        var Name = dataFile[userID].Name;
        var q = Name + " has " + gp + "gp.";
        sendmessage(q, message);
    }
}



var addGolddisplayUser = function (message, x, authorID) {
    if (!dataFile[authorID]) { //this checks if data for the user has already been created
        let user = client.users.get(authorID);
        dataFile[authorID] = { Name: user.username, Gold: x }; //if not, create it
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var disp = "New user to this command, new file created.\n\n";
        disp += "Adding " + x + "gp to " + user + "...\n\n" +
            "**Total gold: __" + dataFile[authorID].Gold + "gp__**";
        sendmessage(disp, message);
    }
    else {
        var gp = Number(dataFile[authorID].Gold);
        var ogp = gp;
        var Name = dataFile[authorID].Name;
        let user = client.users.get(authorID);
        gp += x;
        dataFile[authorID] = { Name: Name, Gold: gp };
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var q = "Adding " + x + "gp to " + user + "...\n\n" +
            "*Original gold: " + ogp + "gp*\n\n" +
            "**Total gold: __" + dataFile[authorID].Gold + "gp__**";
        sendmessage(q, message);
    }
}


var removeGolddisplayUser = function (message, x, authorID) {
    if (!dataFile[authorID]) { //this checks if data for the user has already been created
        let user = client.users.get(authorID);
        dataFile[authorID] = { Name: user.username, Gold: x }; //if not, create it
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var disp = "New user to this command, new file created.\n\n";
        disp += "Can't remove more gold than " + user + "has. Setting to 0gp...\n\n" +
            "**Total gold: __" + dataFile[authorID].Gold + "gp__**";
        sendmessage(disp, message);
    }
    else {
        var gp = Number(dataFile[authorID].Gold);
        var ogp = gp;
        var Name = dataFile[authorID].Name;
        let user = client.users.get(authorID);
        if (gp >= x) {
            gp -= x;
            dataFile[authorID] = { Name: Name, Gold: gp };
            fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
            var q = "Removing " + x + "gp from " + user + "...\n\n" +
                "*Original gold: " + ogp + "gp*\n\n" +
                "**Total gold: __" + dataFile[authorID].Gold + "gp__**";
            sendmessage(q, message);
        }
        else {
            sendmessage("Can't remove more gold than you have, b-baka.", message);
        }
    }
}

var setGolddisplayUser = function (message, x, authorID) {
    let user = client.users.get(authorID);
    if (!dataFile[authorID]) { //this checks if data for the user has already been created
        dataFile[authorID] = { Name: user.username, Gold: x }; //if not, create it
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var disp = "New user to this command, new file created.\n\n";
        disp += "Setting " + user + "'s gp to " + x + "...\n\n" +
            "**Total gold: __" + dataFile[authorID].Gold + "gp__**";
        sendmessage(disp, message);
    }
    else {
        var gp = Number(dataFile[authorID].Gold);
        var ogp = gp;
        var Name = dataFile[authorID].Name;
        gp = x;
        dataFile[authorID] = { Name: Name, Gold: gp };
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var d = "Setting " + user + "'s gp to " + x + "...\n\n" +
            "*Original gold: " + ogp + "gp*\n\n"+
            "**Total gold: __" + dataFile[authorID].Gold + "gp__**";
        sendmessage(d, message);
    }
}
var generateCommonShopItem = function () {
    var table = listFile["ShopTable"];
    var tempitem = table.Common[rolldice("1d" + (table.Common.length)) - 1];
    if (tempitem == "SpellScroll0") {
        tempitem = generateSpellScroll(0);
    }
    if (tempitem == "SpellScroll1") {
        tempitem = generateSpellScroll(1);
    }
    if (tempitem == "Commonitem0") {
        tempitem = generateCommonItem();
        if (tempitem.startsWith("SpellwroughtTattoo") && !isNaN(tempitem[tempitem.length - 1])) {
            TattooTier = tempitem[tempitem.length - 1];
            scrolllist = "ScrollTable" + TattooTier;
            tempitem = "Spellwrought Tattoo (" + RollScrollPotFromName(scrolllist) + ")";
        }
    }
    return tempitem;
}
var generateCommonItem = function (){
    var tempitem = RollScrollPotFromName("CommonItems");
    return tempitem;
}
var generateUncommonShopItem = function () {
    var table = listFile["ShopTable"];
    var tempitem = table.Uncommon[rolldice("1d" + (table.Uncommon.length)) - 1];
    if (tempitem == "Spellscroll2") {
        tempitem = generateSpellScroll(2);
    }
    else if (tempitem == "Spellscroll3") {
        tempitem = generateSpellScroll(3);
    }
    else if (tempitem == "UncommonItem") {
        tempitem = generateUncommonItem();
        if (tempitem.startsWith("SpellwroughtTattoo") && !isNaN(tempitem[tempitem.length - 1])) {
            TattooTier = tempitem[tempitem.length - 1];
            scrolllist = "ScrollTable" + TattooTier;
            tempitem = "Spellwrought Tattoo (" + RollScrollPotFromName(scrolllist) + ")";
        }
    }
    return tempitem;
}
var generateUncommonItem = function () {
    var tempitem = RollScrollPotFromName("UncommonItems");

    if (tempitem == "Potion of Resistance") {
        tempitem = "Potion of " + RollScrollPotFromName("ResistanceTable");
    }
    if (tempitem == "Elemental Gem") {
        tempitem = RollScrollPotFromName("ElementalGem");
    }
    if (tempitem == "Instrument of the Bards") {
        tempitem = RollScrollPotFromName("BardInstrumentUncommon")
    }

    return tempitem;
}

var generateRareShopItem = function () {
    var table = listFile["ShopTable"];
    var tempitem = table.Rare[rolldice("1d" + (table.Rare.length)) - 1];
    if (tempitem == "SpellScroll4") {
        tempitem = generateSpellScroll(4);
    }
    else if (tempitem == "SpellScroll5") {
        tempitem = generateSpellScroll(5);
    }
    else if (tempitem == "RareItem") {
        tempitem = generateRareItem();
        if (tempitem.startsWith("SpellwroughtTattoo") && !isNaN(tempitem[tempitem.length - 1])) {
            TattooTier = tempitem[tempitem.length - 1];
            scrolllist = "ScrollTable" + TattooTier;
            tempitem = "Spellwrought Tattoo (" + RollScrollPotFromName(scrolllist) + ")";
        }
    }
    return tempitem;
}
var generateRareItem = function () {
    var tempitem = RollScrollPotFromName("RareItems");

    if (tempitem == "Armor of Resistance") {
        tempitem = "Armor of " + RollScrollPotFromName("ResistanceTable");
    }
    else if (tempitem == "Elemental Essence Shard") {
        tempitem = RollScrollPotFromName("ElementalEssence");
    }
    else if (tempitem == "Feather Token") {
        tempitem = RollScrollPotFromName("FeatherToken")
    }
    else if (tempitem == "Figurine of Wondrous Power") {
        tempitem = RollScrollPotFromName("FigurineRare")
    }
    else if (tempitem == "Horn of Valhalla") {
        tempitem = RollScrollPotFromName("HornofValhalla")
    }
    else if (tempitem == "Ioun Stone") {
        tempitem = RollScrollPotFromName("IounStoneRare")
    }
    else if (tempitem == "Ring of Resistance") {
        tempitem = "Ring of " + RollScrollPotFromName("ResistanceTable");
    }
    else if (tempitem == "Instrument of the Bards") {
        tempitem = RollScrollPotFromName("BardInstrumentUncommon")
    }
    return tempitem;
}

var generateVRareShopItem = function () {
    var table = listFile["ShopTable"];
    var tempitem = table.VRare[rolldice("1d" + (table.VRare.length)) - 1];
    if (tempitem == "SpellScroll6") {
        tempitem = generateSpellScroll(6);
    }
    else if (tempitem == "SpellScroll7") {
        tempitem = generateSpellScroll(7);
    }
    else if (tempitem == "SpellScroll8") {
        tempitem = generateSpellScroll(8);
    }
    else if (tempitem == "VRareItem") {
        tempitem = generateVRareItem();
        if (tempitem.startsWith("SpellwroughtTattoo") && !isNaN(tempitem[tempitem.length - 1])) {
            TattooTier = tempitem[tempitem.length - 1];
            scrolllist = "ScrollTable" + TattooTier;
            tempitem = "Spellwrought Tattoo (" + RollScrollPotFromName(scrolllist) + ")";
        }
    }
    return tempitem;
}
var generateVRareItem = function () {
    var tempitem = RollScrollPotFromName("VRareItems");
    if (tempitem == "Absorbing Tattoo") {
        tempitem = RollScrollPotFromName("AbsorbingTattoo");
    }
    else if (tempitem == "Belt of Giant Strength") {
        tempitem = RollScrollPotFromName("GiantBeltVRare");
    }
    else if (tempitem == "Carpet of Flying") {
        tempitem = RollScrollPotFromName("CarpetOfFlying")
    }
    else if (tempitem == "Ioun Stone") {
        tempitem = RollScrollPotFromName("IounStoneVRare")
    }
    return tempitem;
}

var generateLegendaryShopItem = function () {
    var table = listFile["ShopTable"];
    var tempitem = table.Legendary[rolldice("1d" + (table.Legendary.length)) - 1];
    if (tempitem == "SpellScroll9") {
        tempitem = generateSpellScroll(9);
    }
    else if (tempitem == "LegendaryItem") {
        tempitem = generateLegendaryItem();
        if (tempitem.startsWith("SpellwroughtTattoo") && !isNaN(tempitem[tempitem.length - 1])) {
            TattooTier = tempitem[tempitem.length - 1];
            scrolllist = "ScrollTable" + TattooTier;
            tempitem = "Spellwrought Tattoo (" + RollScrollPotFromName(scrolllist) + ")";
        }
    }
    return tempitem;
}
var generateLegendaryItem = function () {
    var tempitem = RollScrollPotFromName("LegendaryItems");

    if (tempitem == "Belt of Giant Strength") {
        tempitem = RollScrollPotFromName("GiantBeltLegendary");
    }
    else if (tempitem == "Crystal Ball") {
        tempitem = RollScrollPotFromName("CrystalBalls");
    }
    else if (tempitem == "Ioun Stone") {
        tempitem = RollScrollPotFromName("IounStoneLegendary")
    }
    else if (tempitem == "Ring of Elemental Command") {
        tempitem = RollScrollPotFromName("RingOfElementalCommand")
    }
    else if (tempitem == "Spell Gem") {
        tempitem = RollScrollPotFromName("SpellGems")
    }

    return tempitem;
}

var generateSpellScroll = function (level) {
    var tempscroll = "ScrollTable" + level;
    
    var tempitem = "Scroll of " + RollScrollPotFromName(tempscroll);
    return tempitem;
    
}
var getGold = function (userId) {
    if (dataFile[userId]) {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        var q = Name + " has " + gp + "gp.";
        return gp;
    }
}

var addGold = function (userId, x) {
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        var disp = "User does not exist.";
    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        gp += x;
        dataFile[userId] = { Name: Name, Gold: gp };
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var q = "Adding " + x + "gp to " + message.author + "...\n\n" +
            "Total gold: " + dataFile[userId].Gold + "gp";
    }
}

var removeGold = function (userId, x) {
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        var disp = "User does not exist, use the `!gold add` to create user.";
    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        if (gp >= x) {
            gp -= x;
            dataFile[userId] = { Name: Name, Gold: gp };
            fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
            var q = "Removing " + x + "gp from " + message.author + "...\n\n" +
                "Total gold: " + dataFile[userId].Gold + "gp";
        }
    }
}

var setGold = function (userId, x) {
    if (!dataFile[userId]) { //this checks if data for the user has already been created
        var disp = "User does not exist, use the `!gold add` to create user.";
    }

    else {
        var gp = Number(dataFile[userId].Gold);
        var Name = dataFile[userId].Name;
        gp = x;
        dataFile[userId] = { Name: Name, Gold: gp };
        fs.writeFileSync(dataPath, JSON.stringify(dataFile, null, 2));
        var d = "Setting " + message.author + "'s gp to " + x + "...\n\n" +
            "Total gold: " + dataFile[userId].Gold + "gp";
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
    message.channel.bulkDelete(await message.channel.fetchMessages({ limit: 99 }));
}

var convertToGold = function (plat, gold, silv, copp) {
    copp += 10 * silv + 100 * gold + 1000 * plat;
    silv = 0;
    gold = 0;
    plat = 0;

    silv = Math.floor(copp / 10);
    copp = copp % 10;

    gold = Math.floor(silv / 10);
    silv = silv % 10;

    return [gold, silv, copp];
}
