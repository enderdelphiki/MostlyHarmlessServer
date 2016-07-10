
function html_escape(text) {
    var m = String(text);
    if (m.length > 0) {
        var amp = "&am" + "p;";
        var lt = "&l" + "t;";
        var gt = "&g" + "t;";
        return m.replace(/&/g, amp).replace(/</g, lt).replace(/>/g, gt);
    }
    else {
        return "";
    }
}
function say(message, channel) {
    if (channel === undefined) {
        channel = client.currentChannel();
    }
    client.network().sendChanMessage(channel, message);
}
function print(message, channel, link) {
    if (channel === undefined) {
        channel = client.currentChannel();
    }
    message = html_escape(message);
    if (link === "<ping/>") {
        message = message.replace(/&lt;ping\/&gt;/g, link);
    }
    if (message.indexOf("(link)") !== -1 && link !== undefined) {
        message = message.replace(/\(link\)/g, "<a href ='" + link + "'>" + link + "</a>");
    }
    client.printChannelMessage("<font color = 'orange'><timestamp/><i>Client:</i></font> " + message, channel, true);
}

var bannedtier = function (tier, tar) {
    return  -1 < tier.indexOf("Hackmon")
        ||  -1 < ["Anything Goes", "Challenge Cup", "ORAS Uber", "ORAS Ubers"].indexOf(tier);
}
var usingSleepClause = function (clauses) { return 1 & clauses; };
var usingFreezeClause = function (clauses) { return 2 & clauses; };
var usingDisallowSpectator = function (clauses) { return 4 & clauses; };
var usingItemClause = function (clauses) { return 8 & clauses; };
var usingChallengeCup = function (clauses) { return 16 & clauses; };
var usingNoTimeOut = function (clauses) { return 32 & clauses; };
var usingSpeciesClause = function (clauses) { return 64 & clauses; };
var usingRearrangeTeams = function (clauses) { return 128 & clauses; };
var usingSelfKO = function (clauses) { return 256 & clauses; };
var usingInverted = function (clauses) { return 512 & clauses; };

({
    beforeChallengeReceived : function(id, tar, tier, clauses) {
        if (bannedtier(tier)) {
            print(client.name(tar) + " failed to challenge you with " + tier);
            sys.stopEvent();
        }
        else if (usingNoTimeOut(clauses)) {
            print(client.name(tar) + " failed to challenge you with No Timeout.");
            sys.stopEvent();
        }
        else if (usingDisallowSpectator(clauses)) {
            print(client.name(tar) + " failed to challenge you with Disallow Specs.");
            sys.stopEvent();
        }
        else if (usingChallengeCup(clauses)) {
            print(client.name(tar) + " failed to challenge you with Challenge Cup.");
            sys.stopEvent();
        }
        else if (!usingSleepClause(clauses)) {
            print(client.name(tar) + " failed to challenge you without Sleep Clause.");
            sys.stopEvent();
        }
    }
})