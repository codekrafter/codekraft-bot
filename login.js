let speakeasy = require("speakeasy");
let cp = require('child_process')

module.exports = class LoginModule {
    init(db, client) {
        if (!db.has("login.2fa.secret").value()) {
            var secret = speakeasy.generateSecret();

            //secret.otpauth_url = speakeasy.otpauthURL({ secret: secret.ascii, label: 'Codekraft Bot Login', algorithm: 'sha512' });

            db.set("login.2fa.secret", secret).write();
        }

        this.client = client;
    }

    onPM(msg, db) {
        if (msg.author.bot)
            return;

        if (this.callback) {
            this.callback(msg, db);
            return;
        }

        var cmd = msg.content.toLowerCase().split(" ");
        if (cmd[0] == "login") {
            if (this.loggedin) {
                msg.channel.send("You are already logged in");
            }


            var verified = speakeasy.totp.verify({
                secret: db.get("login.2fa.secret.base32").value(),
                encoding: "base32",
                token: cmd[1]
            });

            //verified = true; // For quick testing/iteration

            this.loggedin = verified;

            if (verified) {
                msg.channel.send("Login Successful");
                this.login(msg, db);
                this.dmChannel = msg.channel;
            }
            else {
                msg.channel.send("Authentication Error: Invalid Code");
            }
        }
        else if (cmd[0] == "logout") {
            this.logout(msg);
        }
        else if (cmd[0] == "status") {
            msg.channel.send(`Logged In: ${this.loggedin}`);
            msg.channel.send(`Current Server: \`${this.currentServer ? this.currentServer.name : "None"}\``);
            msg.channel.send(`Current Channel: \`${this.currentChannel ? this.currentChannel.name : "None"}\``);
        } else if (cmd[0] == "ls") {
            this.ls(msg)
        } else if (cmd[0] == "cd") {
            this.cd(msg);
        } else if (cmd[0] == "listen") {
            this.listen = !this.listen;

            if (this.listen) {
                msg.channel.send("Now listening to Current Channel");
            } else {
                msg.channel.send("Stopped listening to Current Channel");
            }
        } else if (cmd[0] == "send") {
            this.send(msg);
        } else if (cmd[0] == "invite_link") {
            msg.channel.send("`https://discordapp.com/oauth2/authorize?client_id=567529813905244160&scope=bot`");
        } else if (cmd[0] == "update") {
            if (this.currentServer) {
                msg.channel.send("Are you sure you want to reboot and update? Type `codekraft_bot_update_confirm` to confirm this action");
                this.callback = this.updateC;
            } else {
                msg.channel.send("Please authenticate to perform an update");
            }
        } else if (cmd[0] == "remove_role") {
            if (this.currentServer) {
                this.callback = removeRoleC;
                var out = "";
                this.roles = this.currentServer.member(msg.member).roles;

                var i = 0;

                var roles_list = [];

                this.roles.array().forEach(role => {
                    roles_list.push(`\`${i}: ${role.name}\``);
                    i++
                });

                msg.channel.send(roles_list);

            } else {
                msg.channel.send("Please authenticate to perform an update");
            }
        } else {
            msg.channel.send(`Unknown Command \`${msg.content}\``);
        }
    }

    isLoggedIn() {
        return this.loggedin;
    }

    login(msg, db) {
        var guilds = this.client.guilds;

        if (guilds.array().length > 0) {
            msg.channel.send(`${guilds.array().length} Available Servers: `);
            var i = 0;

            var guild_list = [];

            guilds.array().forEach(guild => {
                guild_list.push(`\`${i}: ${guild.name}\``);
                i++
            });

            msg.channel.send(guild_list);

            this.callback = this.serverSelectC;
        }
        else {
            msg.channel.send("No Available Servers");
            this.loggedin = false;
        }
    }

    logout(msg) {
        if (this.loggedin) {
            msg.channel.send(`Logged Out of \`${this.currentServer.name}\``);
        }
        else {
            msg.channel.send("You are already logged out");
        }
        this.loggedin = false;

        this.currentServer = undefined;
    }

    serverSelectC(msg, db) {
        this.callback = undefined;

        var num = parseInt(msg.content);

        if (!isNaN(num)) {
            var guilds = this.client.guilds;

            if (num < 0 || num > guilds.array().length - 1) {
                msg.channel.send(`\`${msg.content}\` is out of range. Please try again`);
                this.callback = this.serverSelectC;
                return;

            }
        }
        else {
            msg.channel.send(`\`${msg.content}\` is not an integer. Please try again`);
            this.callback = this.serverSelectC;
            return;
        }

        this.currentServer = guilds.array()[num];

        msg.channel.send("Sucessfully Logged into `" + this.currentServer.name + "`");
    }

    ls(msg) {
        var channels = this.currentServer.channels.filter(channel => channel.type == "text").array();

        if (channels.length > 0) {
            msg.channel.send(`${channels.length} Available Channels:`);
            var i = 0;
            var cha_list = [];

            channels.forEach(channel => {
                //msg.channel.send(`\`${i}: ${channel.name}\``);
                cha_list.push(`\`${i}: ${channel.name}\``);
                i++
            });

            msg.channel.send(cha_list);
        }
        else {
            msg.channel.send("No Available Channels");
            this.loggedin = false;
        }
    }

    cd(msg) {
        var num_str = msg.content.split(" ")[1]
        var num = parseInt(num_str);

        if (!isNaN(num)) {
            var channels = this.currentServer.channels.filter(channel => channel.type == "text").array();

            if (num < 0 || num > channels.length - 1) {
                msg.channel.send(`\`${num_str}\` is out of range`);
                return;

            }
        }
        else {
            msg.channel.send(`\`${num_str}\` is not an integer`);
            return;
        }

        this.currentChannel = channels[num];

        msg.channel.send("Sucessfully Moved into `" + this.currentChannel.name + "`");
    }

    onListenMessage(msg) {
        if (this.listen) {
            this.dmChannel.send(`\`${msg.author.tag}\`: ${msg.content}`);
        }
    }

    send(msg) {
        if (this.currentChannel && !msg.author.bot) {
            var cmd = msg.content.split(" ");
            this.currentChannel.send(cmd.slice(1, cmd.length).join(" "));
        }
    }

    updateC(msg, db) {
        this.callback = undefined;

        if (msg.content == "codekraft_bot_update_confirm") {
            msg.channel.send("Verification phrase matched, updating...");
            this.update();
        } else {
            msg.channel.send("Does not match verification phrase, aborting update.");
        }
    }

    update() {
        var update_script = cp.exec('"./update.sh" > update.log', { detached: true });
        update_script.unref();

        process.exit(0);
    }

    removeRoleC(msg, db)
{
    if (!this.roles) {
        msg.channel.send("Role is empty");
        this.callback = undefined;
        return;
    } else if (parseInt(msg) == NaN) {
        msg.channel.send("Please enter ca number");
    } else {
        var index = parseInt(msg);

        if (index < 0 || index > (this.roles.length - 1)) {
            msg.channel.send("Please enter a number in range (0-" + this.roles.length - 1 + ")");
            return;
        } else {
            this.currentServer.member(msg.member).removeRole(this.roles[index]);
        }
    }
}
}