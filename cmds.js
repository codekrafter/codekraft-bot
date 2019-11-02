const { RichEmbed } = require("discord.js")


module.exports = class CommandModule {
    constructor() {
        this.hard_commands = {
            "help": {
                type: "func",
                func: function(msg, db) {
                    var res = new RichEmbed()
                        .setTitle("Codekraft Bot Help");


                    msg.author.send(res);
                    msg.reply("Check your DMs!")
                }
            },
            "clear": {
                type: "func",
                func: function(msg, db) {
                    if (msg.member.roles.find(r => r.name === "Mod")) {
                        var num = 10;
                        if(Number.isInteger(msg.toString().split(" ")[1]))
                        {
                            num = msg.toString().split(" ")[1];
                        } else
                        {
                            console.log(msg.toString().split(" ")[1] + " Is not a number");
                        }
                        
                        msg.channel.fetchMessages({ limit: num })
                            .then(messages => {
                                msg.channel.bulkDelete(messages);
                            })
                    }
                }
            },
            "debug": {
                type: "func",
                func: function(msg, db)
                {
                    if(msg.member.id == 145273927248248832)
                    {
                        var execCode = msg.content.substr(1, msg.content.length).split(" ").splice(1).join(" ");
                        
                        // Remove markdown code marking
                        if(execCode[0] == "`")
                        {
                            execCode = execCode.substr(1, execCode.length-2)
                        }

                        //console.log(execCode)
                        
                        try {
                        eval(execCode)
                        } catch (e)
                        {
                            msg.reply("Error executing debug code");
                            msg.channel.send(">>> " + e.toString())
                        }
                    } else
                    {
                        msg.reply("You are not authorized. Begone thot")
                    }
                }
            },
            "report": {
                type: "func",
                func: function(msg, db)
                {
                    const fs = require('fs');

                    fs.appendFile('reports.txt', msg.guild.name + "; " + msg.author.tag + ": " + msg.content.split(" ").splice(1).join(" "), function (err) {
                        if(err) throw err;
                        msg.channel.send("Saved report!")
                    });
                }
            }
        };
    }

    init() {}

    onMessage(msg, db, client) {
        if (msg.content[0] === db.get("prefix").value()) {
            //var cmds = Object.assign(db.get("commands"), this.hard_commands);

            const entered_command = msg.content.substr(1, msg.content.length).split(" ")[0];
            var g_msg = msg;
            var commands = Object.assign(db.get("raw_commands").value(), this.hard_commands);

            var found = false;

            if (entered_command != "cah" && entered_command != "m" || entered_command == "music" && entered_command != "test" && entered_command.length > 0) {
                for (var command in commands) {
                    if (command === entered_command) {

                        var cmd = commands[command];
                        //console.log(`Running ${cmd.type} command ${command}`);
                        if (cmd.type === "raw") {
                            eval(cmd["script"]); //Harmful, I Know shut up about it already IDE
                        }
                        else if (cmd.type === "func") {
                            cmd["func"](msg, db);
                        }

                        found = true;
                        msg.delete();
                    }
                }

                if (!found) {
                    msg.reply("Command `" + entered_command + "` is not valid. Try typing `" + db.get("prefix").value() + "` to get help with commands");
                }
            }
        }
    }
}
