const { Client, RichEmbed } = require('discord.js');
const client = new Client();

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const f_db = new FileSync('db.json')
const db = low(f_db)

const ResponseMod = require("./resp.js");
const CommandMod = require("./cmds.js");
const AutoModMod = require("./automod.js");
const CAHMod = require("./cah.js");
const LoginMod = require("./login.js");
const EntryMod = require("./entry.js");
const MusicMod = require("./music.js");

let ResponseModule = new ResponseMod();
let CommandModule = new CommandMod();
let AutoModModule = new AutoModMod();
let CAHModule = new CAHMod();
let LoginModule = new LoginMod();
let EntryModule = new EntryMod();
let MusicModule = new MusicMod();

var oauth_key = undefined;
var yt_key = undefined;
// Set some defaults (required if your JSON file is empty)
//db.defaults({ raw_commands: { "test": { type: "raw", script: "g_msg.channel.send('test');" } } })
//    .write()

var runCountdownBot;

client.on('ready', () => {
    db.read();

    AutoModModule.init();
    ResponseModule.init();
    CommandModule.init();
    CAHModule.init(db);
    LoginModule.init(db, client, oauth_key);
    EntryModule.init();
    MusicModule.init(db, yt_key);

    console.log(`Bot Initialized`);

    runCountdownBot();
});

client.on('message', msg => {
    db.read();
    if (msg.guild) {
        var g_db = db.get(msg.guild.id.trim());
        var valid = AutoModModule.onMessage(msg, g_db);
        if (valid) {
            ResponseModule.onMessage(msg, g_db);
            CommandModule.onMessage(msg, g_db, client);
            CAHModule.onMessage(msg, g_db);
            EntryModule.onMessage(msg, g_db);
            MusicModule.onMessage(msg, g_db);

            if (msg.channel == LoginModule.currentChannel) {
                LoginModule.onListenMessage(msg);
            }
        }
    }
    else {
        LoginModule.onPM(msg, db);
    }
});

client.on('messageReactionAdd', (react, usr) => {
    db.read();
    var g_db = db.get(react.message.guild.id.trim());
    EntryModule.onReaction(react, usr, g_db);
})

let fs = require("fs");

/*var token = fs.readFileSync('secret.token', 'utf8').toString().trim();

var newToken = "";

//db.read()
//var secretObj = {token: token, auth: db.get("login").value()}
//fs.writeFileSync("secret.json", JSON.stringify(secretObj));

for(var i = 0; i < token.length;i++)
{
    if(token.charCodeAt(i) != 0 && token.charCodeAt(i) != 65533)
        newToken += token[i];
}
console.log(newToken === token);
token = newToken;
if (token) {
    client.login(token).catch(e => console.log("Error: " + e));
}
else {
    console.log("Token is invalid")
    process.exit();
}*/

var secret = JSON.parse(fs.readFileSync('secret.json', 'utf8').toString().trim());
var token = secret.token;
if (token) {
    client.login(token).catch(e => console.log("Error: " + e));
}
else {
    console.log("Token is invalid")
    process.exit();
}
oauth_key = secret.auth;
yt_key = secret.yt_token;

function exitHandler(options, exitCode)
{
    client.voiceConnections.forEach(val => val.disconnect());

    //if (options.cleanup) console.log('clean');
    if (exitCode && exitCode != 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

var schedule = require('node-schedule');

var j = schedule.scheduleJob('0 12 * * *', function(){
  runCountdownBot();
});

var term1 = new Date("2020-6-9");
// Wipe time from today
today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

runCountdownBot = function() {
	var today = new Date();
	client.guilds.get("465587066344964098").channels.get("467892434810961920").send(Math.ceil((term1.getTime()  - today.getTime()) / (1000 * 60 * 60 * 24)) + " days until TiP starts!");
}
