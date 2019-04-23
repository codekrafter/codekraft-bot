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

let ResponseModule = new ResponseMod();
let CommandModule = new CommandMod();
let AutoModModule = new AutoModMod();
let CAHModule = new CAHMod();

let Logger = require("./logger.js");

// Set some defaults (required if your JSON file is empty)
db.defaults({ raw_commands: {"test": {type: "raw", script: "g_msg.channel.send('test');"}}})
  .write()

client.on('ready', () => {
    db.read();
    
    Logger.init();
    
    AutoModModule.init();
    ResponseModule.init();
    CommandModule.init();
    CAHModule.init();

    console.log(`Bot Initialized`);
});

client.on('message', msg => {
    db.read();
    Logger.preLoop();
    
    var valid = AutoModModule.onMessage(msg, db);
    if(valid)
    {
        ResponseModule.onMessage(msg, db);
        CommandModule.onMessage(msg, db, client);
        CAHModule.onMessage(msg, db);
    }
    
    Logger.postLoop();
});

client.login('NTY3NTI5ODEzOTA1MjQ0MTYw.XLVDJw.g-RHkjdGvLiX0eq7AOJtYgdq4Us');