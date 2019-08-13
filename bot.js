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
const LoginMod = require("./login.js")
const EntryMod = require("./entry.js")

let ResponseModule = new ResponseMod();
let CommandModule = new CommandMod();
let AutoModModule = new AutoModMod();
let CAHModule = new CAHMod();
let LoginModule = new LoginMod();
let EntryModule = new EntryMod();

// Set some defaults (required if your JSON file is empty)
//db.defaults({ raw_commands: { "test": { type: "raw", script: "g_msg.channel.send('test');" } } })
//    .write()

client.on('ready', () => {
    db.read();

    AutoModModule.init();
    ResponseModule.init();
    CommandModule.init();
    CAHModule.init(db);
    LoginModule.init(db, client);
    EntryModule.init();

    console.log(`Bot Initialized`);
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

var token = fs.readFileSync('secret.token', 'utf8').toString().trim();
var newToken = "";
for(var i = 0; i < token.length;i++)
{
    if(token.charCodeAt(i) != 0 && token.charCodeAt(i) != 65533)
        newToken += token[i];
}
console.log(newToken);
token = newToken;
if (token) {
    client.login(token).catch(e => console.log("Error: " + e));
}
else {
    console.log("Token is invalid")
    process.exit();
}
