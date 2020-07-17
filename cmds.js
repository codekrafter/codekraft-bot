const { RichEmbed, Attachment } = require("discord.js");

let fs = require("fs");
var text2png = require("text2png");

module.exports = class CommandModule {
  constructor() {
    this.hard_commands = {
      help: {
        type: "func",
        func: function (msg, db) {
          var res = new RichEmbed().setTitle("Codekraft Bot Help");

          msg.author.send(res);
          msg.reply("Check your DMs!");
        },
      },
      clear: {
        type: "func",
        func: function (msg, db) {
          if (msg.member.roles.find((r) => r.name === "Mod")) {
            var num = 10;
            if (Number.isInteger(msg.toString().split(" ")[1])) {
              num = msg.toString().split(" ")[1];
            } else {
              console.log(msg.toString().split(" ")[1] + " Is not a number");
            }

            msg.channel.fetchMessages({ limit: num }).then((messages) => {
              msg.channel.bulkDelete(messages);
            });
          }
        },
      },
      debug: {
        type: "func",
        func: function (msg, db) {
          if (msg.member.id == 145273927248248832) {
            var execCode = msg.content
              .substr(1, msg.content.length)
              .split(" ")
              .splice(1)
              .join(" ");

            // Remove markdown code marking
            if (execCode[0] == "`") {
              execCode = execCode.substr(1, execCode.length - 2);
            }

            //console.log(execCode)

            try {
              eval(execCode);
            } catch (e) {
              msg.reply("Error executing debug code");
              msg.channel.send(">>> " + e.toString());
            }
          } else {
            msg.reply("You are not authorized. Begone thot");
          }
        },
      },
      report: {
        type: "func",
        func: function (msg, db) {
          const fs = require("fs");

          fs.appendFile(
            "reports.txt",
            msg.guild.name +
              "; " +
              msg.author.tag +
              ": " +
              msg.content.split(" ").splice(1).join(" "),
            function (err) {
              if (err) throw err;
              msg.channel.send("Saved report!");
            }
          );
        },
      },
      quote: {
        type: "func",
        func: async function (msg, db) {
          var targetText = msg.toString().split(" ")[1];
          if (targetText != null) targetText = targetText.trim();
          console.log("target: " + targetText);

          var targetMessage = undefined;

          // Link
          if (targetText.startsWith("http")) {
            try {
              var split = targetText
                .split("discordapp.com/channels/")[1]
                .split("/")
                .filter((el) => el != null && el != undefined && el.length > 0);
              if (split.length == 0) throw TypeError;

              //console.log(split);

              var guildId = split[0];
              var channelId = split[1];
              var messageId = split[2];

              var guild = msg.client.guilds.get(guildId);
              if (guild != undefined) {
                var channel = guild.channels.get(channelId);
                if (channel != undefined) {
                  if (channel.type != "text") {
                    msg.channel.send(
                      "Unable to quote message. The provided channel is not a text channel :("
                    );
                    return;
                  }

                  var message = await channel.fetchMessage(messageId);
                  if (message != undefined) {
                    targetMessage = message;
                  } else {
                    msg.channel.send(
                      "Unable to quote message. I couldn't find the target message :("
                    );
                    return;
                  }
                } else {
                  msg.channel.send(
                    "Unable to quote message. I couldn't find the channel that message is from :("
                  );
                  return;
                }
              } else {
                msg.channel.send(
                  "Unable to quote message. I'm not in the server where that message came from :("
                );
                console.log("Couldnt find guild: '" + guildId + "'");
                console.log(msg.client.guilds.get(guildId) == undefined);
                return;
              }
            } catch (TypeError) {
              msg.channel.send("URL is invalid or not a discord message URL");
              return;
            }
          }
          // Numerical ID
          else if (!Number.isNaN(targetText.trim())) {
            targetMessage = await msg.channel.fetchMessage(targetText);
          }
          // Other (Text Search)
          else {
            //TODO
          }

          if (targetMessage === undefined) {
            msg.channel.send("Could not find message to quote");
          } else {
            const focus_emoji = msg.client.emojis.get("660730829932199956"); // Right now its huber
            var embed = new RichEmbed()
              .setTitle(targetMessage.content)
              //.setURL(targetMessage.url)
              .setDescription("[**🔼**](" + targetMessage.url + ")")
              .setAuthor(
                targetMessage.member.displayName,
                targetMessage.author.displayAvatarURL
              )
              .setTimestamp(targetMessage.createdAt);
            //.setImage(focus_emoji.url)

            msg.channel.send(embed);
          }
        },
      },
      big: {
        type: "func",
        func: async function (msg, db) {
          var parts = msg.content.split(" ").slice(1);
          if (parts[0] == undefined) {
            msg.channel.send("Please specify text to make big!");
            return;
          }
          // Check if size was specified
          var size = "50px";
          var text = parts.join(" ");

          if (parts[0].split("").reverse().join("").substr(0, 2) == "xp") {
            size = parts[0];
            text = parts.slice(1).join(" ");
          }
          try {
            var img_buffer = text2png(text, {
              color: "white",
              padding: 5,
              font: `${size} "Helvetica Neue"`,
              localFontPath: "HelveticaNeue Medium.ttf",
              localFontName: "Helvetica Neue",
            });

            let attachment = new Attachment(img_buffer, "text.png");

            let imgEmbed = new RichEmbed()
              .setAuthor(msg.member.displayName, msg.author.displayAvatarURL)
              .attachFile(attachment)
              .setImage("attachment://text.png");
            //msg.channel.sendFile(img_buffer);
            await msg.channel.send(imgEmbed);
          } catch (err) {
            msg.channel.send("Error creating big text");
            console.log(err);
            return;
          }
        },
      },
      meeting: {
        type: "func",
        func: async function (msg, db) {},
      },
    };
  }

  init() {}

  onMessage(msg, db, client) {
    if (msg.content[0] === db.get("prefix").value()) {
      //var cmds = Object.assign(db.get("commands"), this.hard_commands);
      const prefix = db.get("prefix").value();
      const entered_command = msg.content
        .substr(1, msg.content.length)
        .split(" ")[0];
      var g_msg = msg;
      var commands = Object.assign(
        db.get("raw_commands").value(),
        this.hard_commands
      );

      var found = false;

      if (
        (entered_command != "cah" && entered_command != "m") ||
        (entered_command == "music" &&
          entered_command != "test" &&
          entered_command.length > 0)
      ) {
        for (var command in commands) {
          if (command === entered_command) {
            var cmd = commands[command];
            //console.log(`Running ${cmd.type} command ${command}`);
            if (cmd.type === "raw") {
              eval(cmd["script"]); //Harmful, I Know shut up about it already IDE
            } else if (cmd.type === "func") {
              cmd["func"](msg, db);
            }

            found = true;
            msg.delete();
          }
        }
        if (
          !found &&
          entered_command.split(prefix).filter((str) => str.length > 0).length
        ) {
          msg.reply(
            "Command `" +
              entered_command +
              "` is not valid. Try typing `" +
              prefix +
              "help` to get help with commands"
          );
        }
      }
    }
  }
};
