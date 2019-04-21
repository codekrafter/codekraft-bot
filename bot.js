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

let ResponseModule = new ResponseMod();
let CommandModule = new CommandMod();
let AutoModModule = new AutoModMod();
let CAHModule = new CAHMod();
let LoginModule = new LoginMod();

// Set some defaults (required if your JSON file is empty)
db.defaults({ raw_commands: { "test": { type: "raw", script: "g_msg.channel.send('test');" } } })
    .write()

client.on('ready', () => {
    db.read();

    AutoModModule.init();
    ResponseModule.init();
    CommandModule.init();
    CAHModule.init();
    LoginModule.init(db, client);

    console.log(`Bot Initialized`);
});

client.on('message', msg => {
    db.read();

    if (msg.guild) {
        var valid = AutoModModule.onMessage(msg, db);
        if (valid) {
            ResponseModule.onMessage(msg, db);
            CommandModule.onMessage(msg, db, client);
            CAHModule.onMessage(msg, db);

            if (msg.channel == LoginModule.currentChannel) {
                LoginModule.onListenMessage(msg);
            }
        }
    }
    else {
        LoginModule.onPM(msg, db);
    }
});

let fs = require("fs");

var token = fs.readFileSync('secret.token', 'utf8').toString();

if (token) {
    client.login(token).catch(e => console.log("Error: " + e));
} else
{
    console.log("Token is invalid")
    process.exit();
}
