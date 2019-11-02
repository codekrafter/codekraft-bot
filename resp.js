module.exports = class ReponseModule {
    constructor() {

    }

    init(db) { }

    onMessage(msg, db) {
        if (!msg.author.bot && msg.channel.id != 567476531354665002) {

            //console.log(msg.author.tag);
            var resps = db.get("responses").value();
            for (var resp in resps) {
                if (msg.content.toLowerCase() == resp.toLowerCase()) {
                    msg.channel.send(resps[resp].toString().replace("\[REF\]", msg.author));
                }
            }

            // Advanced Responses
            var adv_resps = db.get("adv-responses").value();
            for (var adv_resp in adv_resps) {
                var index = msg.content.toLowerCase().search(adv_resp);
                if (index != -1) {
                    msg.channel.send(adv_resps[adv_resp].toString().replace("\[REF\]", msg.author));
                }
            }

            //Dad Bot
            if (db.get("dad_bot").value()) {
                var index = msg.content.toString().toLowerCase().search("(i)('|’| |)(m|(am))");
                if (index === 0) {
                    var im = msg.content.substr(index, msg.content.length - index);
                    var mi = im.indexOf('m', 0);
                    if (mi != -1) {
                        var adj = im.substr(mi + 1, im.length - mi);
                        if (adj[0] == " ") {
                            if (adj.substr(0, 3) == " a ") {
                                adj = adj.substr(3);
                            }

                            if (adj.substr(0, 4) == " an ") {
                                adj = adj.substr(4);
                            }

                            msg.channel.send("Hi " + adj.trim().substr(0, 50) + ", I'm dad");
                        }
                    }
                }
            }

            //Huber Correction
            if (db.get("huber_correct").value()) {
                //Old DB: "[^(master)](dr|mr|)(\\.*)( *)huber": "[REF] You mean **Master** Huber",
                var split = msg.content.toString().toLowerCase().split(" ");

                index = split.indexOf("huber");
                if (index > -1) {
                    var preWord;
                    var prePreWord;
                    if (split[index - 1]) {
                        preWord = split[index - 1].trim();
                        prePreWord = split[index - 1].trim();
                    }
                    console.log(preWord);

                    if (preWord != "master" && (preWord != "emperor" && prePreWord != "god") && preWord != "daddy") {
                        msg.reply("You mean ***Master*** Huber");
                    }
                }
            }
	    
	    // Henry Teasing
	   var str = msg.content.toLowerCase();
            if (msg.author.id == 578372843071340546 && (str.includes("parent") || str.includes("mom") || str.includes("mother") || (str.includes("dad") && !str.includes("daddy")) || str.includes("father"))) {
                msg.channel.send("Helicopter Incoming!");
            }
        }
    }
}
