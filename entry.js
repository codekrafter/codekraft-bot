module.exports = class EntryModule {
    constructor() {

    }

    messages = [];

    init() { }

    onMessage(msg, db) {
        const cmds = msg.content.substr(1, msg.content.length).split(" ");
        if (cmds[0] == "test" && cmds[1] == "welcome") {
            console.log("testing welcome");
            this.sendWelcome(msg.guild, msg.author, db);
            msg.delete();
        }
    }

    onReaction(reaction, user, db) {
        if (user.bot)
            return;

        if (this.messages.indexOf(reaction.message.id) != -1) {
            if (reaction.emoji.name == "🇹") {
                console.log("tipster");
                reaction.message.delete();
                this.messages = this.messages.filter(id => id !== reaction.message.id);
            } else if (reaction.emoji.name == "🇸") {
                console.log("staff");
                reaction.message.delete();
                this.messages = this.messages.filter(id => id !== reaction.message.id);
            } else if (reaction.emoji.name == "🇦") {
                console.log("alumni");
                reaction.message.delete();
                this.messages = this.messages.filter(id => id !== reaction.message.id);
            }
        }
    }

    sendWelcome(guild, user, db) {
        var welcome_msg = "Welcome <@" + user.id + ">! Please React with :regional_indicator_t: if you are a tipster, :regional_indicator_s: if you are staff or :regional_indicator_a: if are an alumni";
        guild.channels.get(db.get("welcome_channel").value()).send(welcome_msg).then(msg => { this.messages.push(msg.id); return msg }).then(msg => msg.react("🇹")).then(react => react.message.react("🇸")).then(react => react.message.react("🇦"));
    }
}
