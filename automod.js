let Logger = require("./logger.js");

module.exports = class AutoModModule {
    constructor() {

    }

    init() {}

    onMessage(msg, db) {
        if (msg.guild) {
            if (msg.member.roles.find(r => r.name === "Mute")) {
                msg.delete();
                return false;
            }
            else if (msg.content.search(".*fag.*") != -1 || msg.content.search(".*nig.*") != -1) {
                Logger.log(`Deleting bad word ${msg.content} from user ${msg.author.tag}`)
                msg.delete();
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }
    }
}
