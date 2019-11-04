const { RichEmbed } = require("discord.js")
const ytdl = require("ytdl-core-discord");
const ytdl_core = require('ytdl-core');
//const ffmpeg = require("ffmpeg");
const search = require('youtube-search');
const util = require('util');

/*
var search_prom = function(query, opts)
{
    return new Promise(function(resolve, reject) {
        search(query, opts, resolve);
    });
}*/

const search_prom = util.promisify(search);

function secondsToString(seconds) {
    var days = Math.floor(seconds / 86400);
    var hours = Math.floor((seconds % 86400) / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var seconds = Math.floor(seconds % 60);

    var str = "";

    if (days > 0) {
        str += days + ":";
    }
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    str += hours + ":";
    str += minutes + ":";
    str += seconds;

    return str;
}

module.exports = class MusicModule {
    constructor() {
    }

    init(db, key) {
        this.queue = new Map();
        this.current = {}

        this.key = key;
    }

    async playSong(guild, song, key) {

        if (!song) {
            console.log("Disconnecting connection")
            this.queue[guild.id].connection.disconnect();
            //this.queue[guild.id].voiceChannel.leave();
            this.queue[guild.id].songs = [];
            return;
        }
        var stream = await ytdl(song.url);
        stream.on("error", err => console.err(err)).on('end', (reason) => console.log("ytdl ended, reason: " + reason))
        const dispatcher = this.queue[guild.id].connection.playOpusStream(stream);
        dispatcher.on('end', (reason) => {
                console.log("Dispatcher Ended, reason: " + reason)
                this.queue[guild.id].songs.shift();
                this.playSong(guild, this.queue[guild.id].songs[0]);
                return;
            }).on('error', error => console.error(error))
            .on("debug", (info) => console.log("debug info: " + info))

        dispatcher.setVolumeLogarithmic(2 / 5);
    }

    async onMessage(msg, db) {
        var parts = msg.content.substr(1, msg.content.length).split(" ");
        const prefix = db.get("prefix").value();
        if (msg.content[0] != prefix)
            return;

        if (this.queue[msg.guild.id] == undefined) {
            this.queue[msg.guild.id] = { vc: undefined, connection: null, songs: [], playing: false };
        }

        if (parts[0] === "music" || parts[0] === "m") {
            parts = parts.slice(1);
        } else {
            return;
        }

        switch (parts[0].toLowerCase()) {
            case "help":
                var res = new RichEmbed()
                    .setTitle("Codekraft Bot Music Module Help")
                    .setDescription("Precede all commands with `m` or `music`, like `" + prefix + "music help`")

                    .addField("**help**", "show music module help (this message)")
                    .addField("**play** <url|title>", "Plays the youtube url, or searches for the title on youtube, and plays the first result")
                    .addField("**stop**", "Stops playing all songs and leaves the current voice channel")
                    .addField("**skip** <index>", "Skips the selected song, in the queue or currently playing (default 0)")
                    .addField("**queue**", "Prints out each song in the queue")
                    .addField("**nowplaying|np**", "Prints out information about the currently playing song");


                msg.channel.send(res);
                break;
            case "play":
                if (msg.member.voiceChannel == undefined) {
                    msg.channel.send("You are not in a voice channel, please join one to play a song");
                    return;
                }

                if (parts[1] == " " || parts[1] == undefined) {
                    msg.channel.send("Please provide a song to play");
                    return;
                }

                parts[1] = parts[1].trim()
                var preprot = parts[1].split("://")[0];
                var url = undefined;
                if (preprot == "http" || preprot == "https" || (parts[1].split(".")[0] == "www" && parts[1].split(".")[1] == "youtube") || parts[1].split(".")[0] == "youtube") {
                    url = parts[1];
                } else {

                    var opts = {
                        maxResults: 1,
                        key: this.key
                    };
                    var query = parts.slice(1).join(" ");
                    //console.log(query)
                    //console.log(this.key)
                    /*search(query, opts, function (err, results) {
                        if (err) return console.log(err);
                        
                        if(results.length > 0)
                        {
                            console.dir(results[0].link);
                            url = results[0].link
                        }
                        
                    });*/

                    var data = await search_prom(query, opts);

                    if (data.length > 0) {
                        url = data[0].link
                    }
                }

                this.queue[msg.guild.id].vc = msg.member.voiceChannel;
                let songInfo = await ytdl_core.getInfo(url);
                //console.log(songInfo);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url,
                    requester: msg.member.nickname,
                    time: songInfo.length_seconds
                }

                this.queue[msg.guild.id].playing = true;
                this.queue[msg.guild.id].songs.push(song);
                if (!this.queue[msg.guild.id].connection) {
                    try {
                        var conn = await msg.member.voiceChannel.join();
                        this.queue[msg.guild.id].connection = conn;

                        this.playSong(msg.guild, song)
                        msg.channel.send("Playing song...");
                    } catch (err) {
                        msg.channel.send("Error encountered while attempting to play song");
                        console.error("Unable to join voice channel " + msg.member.voiceChannel + "; error: " + err);
                        return;
                    }
                } else
                {
                   // console.log(this.queue[msg.guild.id].connection)
                }

                break;
            case "stop":
                this.playSong(msg.guild, undefined)
                break;
            case "queue":
                if (this.queue[msg.guild.id].songs.length == 0) {
                    var res = new RichEmbed()
                        .setTitle("Queue Empty")
                        .setDescription("No songs are queued");

                    msg.channel.send(res)
                } else {
                    //console.log(this.queue[msg.guild.id].songs)
                    var res = new RichEmbed()
                        .setTitle(this.queue[msg.guild.id].songs.length - 1 + " Songs in Queue");
                    //.addField("", )
                    //.setDescription("No songs are queued");
                    var i = 0
                    this.queue[msg.guild.id].songs.forEach((song) => {
                        if (i == 0) {
                            res.addField("**Now Playing: " + i + "** - " + song.title, secondsToString(song.time) + ", Requested by: *" + song.requester + "* | [Link](" + song.url + ")");
                        } else
                        {
                            res.addField("**" + i + "** - " + song.title, secondsToString(song.time) + ", Requested by: *" + song.requester + "* | [Link](" + song.url + ")");
                        }

                        i++;
                    })

                    msg.channel.send(res)
                }
                break;
            case "nowplaying":
            case "np":
                if(this.queue[msg.guild.id].songs.length > 0)
                {
                    var res = new RichEmbed()
                        .setTitle("Now Playing");
                    res.addField("**Now Playing: " + i + "** - " + song.title, secondsToString(song.time) + ", Requested by: *" + song.requester + "* | [Link](" + song.url + ")")
                } else
                {
                    msg.channel.send("No songs playing")
                }
                break;
            default:
                msg.channel.send("Unknown Music Command, try `music help` to get all valid commands")
        }

        msg.delete()
    }
}