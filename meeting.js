module.exports = class MeetingModule {
  constructor() {}

  init(db) {}

  async onMessage(msg, db) {
    const content = msg.content;
    if (db.get("meeting_control").value()) {
      if (content.substr(0, 8) === "!meeting" || content.substr(0, 3) === "!m ") {
        if (msg.member.hasPermission("MANAGE_MESSAGES")) {
          const splitMessage = content.split(" ");
          if (splitMessage.length >= 3) {
            let action = splitMessage[1];
            if (
              action === "enable" ||
              action === "e" ||
              action === "disable" ||
              action === "d"
            ) {
              if (action === "e") {
                action = "enable";
              } else if (action === "d") {
                action = "disable";
              }
              this.performAction(action, splitMessage[2], db, msg);
            } else {
              this.printHelp(msg.channel, msg.content);
            }
          } else {
            if (
              splitMessage.length === 2 &&
              splitMessage[1].toLowerCase() === "list"
            ) {
              const rooms = db.get("meeting_rooms").value();
              if (rooms) {
                await msg.channel.send("**All Meeting Rooms:**");
                for (const room of rooms) {
                  msg.channel.send("`" + room.id + "`: " + room.desc);
                }
              } else {
                await msg.channel.send("*Could not find any configured rooms*");
              }
            } else if (
              splitMessage.length === 2 &&
              splitMessage[1].toLowerCase() === "help"
            ) {
              this.printHelp(msg.channel);
            } else {
              this.printHelp(msg.channel, msg.content);
            }
          }
        } else {
          msg.reply("You don't have permission to use this command");
        }
      }
    }
  }

  async printHelp(channel, invalidCommand = null) {
    if (invalidCommand) {
      await channel.send(
        "*Invalid meeting command `" +
          invalidCommand +
          "`*. Please use `!meeting help` to get a list of valid commands"
      );
    } else {
      await channel.send("**Valid Meeting Commands:**");
      await channel.send("`!meeting list`: lists all meeting rooms");
      await channel.send("`!meeting enable <id>`: Enables a meeting room");
      await channel.send("`!meeting disable <id>`: Disables a meeting room");
    }
  }

  async performAction(action, roomId, db, msg) {
    const rooms = db.get("meeting_rooms").value();

    const room = rooms.find((room) => room.id === roomId);

    const memberRole = msg.guild.roles.get("733446830368751617");

    if (room) {
      if (action === "enable") {
        msg.client.channels
          .get(room.cat_id)
          .overwritePermissions(memberRole, {
            VIEW_CHANNEL: true,
          });
      } else if (action === "disable") {
        console.log("disabling meeting");
        msg.client.channels
          .get(room.cat_id)
          .overwritePermissions(memberRole, {
            VIEW_CHANNEL: false,
          });
      } else {
        msg.channel.send(
          "ERROR: unknown internal action `" + action + "`!"
        );
      }
    } else {
      await msg.channel.send(
        "*ERROR: Could not find room with id `" + id + "`*"
      );
    }
  }
};
