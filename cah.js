module.exports = class CAHModule {
    constructor() {

    }

    init(db) {}

    onMessage(msg, db) {
        if (msg.content.substring(0, 4) == db.get("prefix").value() + "cah") {
            var cmd = msg.content.substr(5, msg.content.length - 5).split(" ");
            
            var primary = cmd[0].toLowerCase();
            
            if (primary === "help") {
                msg.reply(`
                Here are the Cards Against Humanity Commands:
                \`start\`: starts a new game
                
                \`packs\`: lists the current installed packs
                
                \`end [game]\`: ends a game, or all of your current games
                `.trim())
            }
            else if (primary === "start") {
                msg.react("➕")
                .then(() => msg.react("➖"))
                .then(() => msg.react("⏯"))
                .catch(console.error);
            }
            else if (primary === "packs") {}
            else if (primary === "end") {}
            else {
                msg.channel.send("Unknown Cards Against Humanity Command `" + cmd[0] + "`. Use `" + db.get("prefix").value() + "cah help` to get help");
            }

            //msg.delete();
        }
    }
    
    onReaction(reaction, user)
    {
        
    }
}
