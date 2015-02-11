/*---------------------------*/
//      Ender's Script ++    //
/*---------------------------*/

//  Global "Object" names
var Award, Config, db, Banner, WelcomeBot, Tumbleweed, ChatBot, TierBot, Guard, NickBot, TourBot, Party, CommandBot, Pictures, AuthLogs, ipbans;

var root = "https://raw.githubusercontent.com/todd-beckman/MostlyHarmlessServer/master/";

var includes = ["pictures.json","config.json","bannerdat.json","chatdat.json","tierdat.json","dbdat.json","awarddat.json","tumbleweed.json","trainers.json"];

//  this allows json updates that break the script
var forcereload = [];
function include() {
    var files = sys.filesForDirectory(".");
    includes.forEach(function(element, index, array) {
        if (-1 == files.indexOf(element) || -1 < forcereload.indexOf(element)) {
            sys.webCall(root + element, function(write) {
                sys.writeToFile(element, write);
                print("Loaded " + element);
            });
        }
    });
}
try {
    include();
}
catch(e) {
    print(e);
}

//  The object managed by init:Clan.prototype;
var chan, logs,

/*  The object managed by init:Hash.prototype; stores local variables that are to be saved
        between server sessions in case of crash, disconnection, etc.    */
    hash,
        
//  The object managed by Init:Assassin.prototype; allows the ability to play the game Assassin
    assassin,
    
//  channel IDs assigned by the server; they must be instantiated in init before use
    clanchan, league, main, party, staffchan, watch, elsewhere,
    
//  The object managed by init:Tournament.prototype; manages tournaments
    tour,
    
//  A bunch of lists that allow for quick lookup when using database-accessing commands
    heightList, weightList, powerList, categoryList, accList, ppList, moveEffList, moveFlagList,
    abilityList, itemList, berryList, flingPowerList, berryPowerList, berryTypeList,

//  Command dictionaries
    HiddenCommands, UserCommands, RPCommands, TourCommands, PartyCommands, ModCommands, AdminCommands, OwnerCommands;

var failed = true;
poScript = ({

init : function (){
    /*
        The db object acts as a static "library" of global functions, extending those built-in
            ones in the sys object. Context-free functions should be added to this object in
            future updates.
    */
    db = {
        getFileContent: function (file) {
            try {
                return sys.getFileContent(file);
            }
            catch (e) {
                print("Unable to read file " + file);
                sys.sendAll("Unable to read file " + file, watch);
                return "";
            }
        },
        data : JSON.parse(sys.getFileContent("dbdat.json")),
        
        
        //  Formats a bot's display message intended for just a user to see.
        sendBotMessage : function (target, message, channel, name, color) {
            //  If the chan parameter is -1, it is intended to display to all channels.
            if (channel == -1) {
                sys.sendHtmlMessage(target, "<font style='color:" + color + "'><timestamp/>-&gt;<b><i>" + name + ":</i></b> " + message + "</font>");
            } else {
                sys.sendHtmlMessage(target, "<font style='color:" + color + "'><timestamp/>-&gt;<b><i>" + name + ":</i></b> " + message + "</font>", channel);
            }
        },
        
        //  Formats a bot's display message intended for all users to see.
        sendBotAll : function (message, channel, name, color) {
            //  If the chan parameter is -1, it is intended to display to all channels.
            if (channel == -1) {
                sys.sendHtmlAll("<font style='color:" + color + "'><timestamp/>-&gt;<b><i>" + name + ":</i></b> " + message + "</font>");
            } else {
                sys.sendHtmlAll("<font style='color:" + color + "'><timestamp/>-&gt;<b><i>" + name + ":</i></b> " + message + "</font>", channel);
            }
        },
        
        debugsay : function (source, channel, varname, vardata) {
            sys.sendMessage(source, "->Debug: " + varname + "=" + vardata + ";", channel);
        },

        iptoint : function (ip) {
            var d = ip.split('.');
            return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
        },

        inttoip : function (num) {
            var d = num % 256;
            for (var i = 3; i > 0; i--) {
                num = Math.floor(num/256);
                d = num % 256 + '.' + d;
            }
            return d;
        },
        
        //  Overrides the sys.auth to give SuperUser status higher auth.
        auth : function (source) {
            //  The user must be logged in; otherwise, less than a user.
            if (sys.name(source) == undefined) {
                return -1;
            }
            
            //  Grant auth level 4 to SuperUsers
            if (-1 <  Config.SuperUsers.indexOf(sys.name(source))) {
                return 4
            }

            //  Call sys function otherwise; we don't have any other exceptions.
            return sys.auth(source);
        },
        
        //  Creates a color for the channels; the color is decided based on the channel's id
        channelColor : function (channel) {
            //  grab one of the colors based on the channel id
            return Config.ChannelColors[channel % Config.ChannelColors.length];
        },
        
        //  HTML-formatted display for the watch channel to display where events take place.
        channelToString : function (channel) {
            //  [#ChanName]
            return "[<b><font color=" + db.channelColor(channel) + ">#" + sys.channel(channel) + "</font></b>]";
        },
        
        //  Make a new file to read; it creates a file with the content in replacement if the 
        //      file does not exist in the path specified. This helps keep the files ready for
        //      JSON and similar forms of formatting.
        createFile : function (file, replacement) {
        
            //  A trick to get sys to make a new file if it doesn't exist, but does not affect
            //      existing files.
            sys.appendToFile(file, "");
            
            //  If the file was empty before, even if it existed as an empty file
            if (sys.getFileContent(file) == "") {
            
                //  then put replacement inside.
                sys.writeToFile(file, replacement);
            }
        },
        
        //  Calculates what a given stat will be of a Pokémon when it is sent into battle
        calcStat : function (base, IV, EV, level, nature) {
        
            //  The formula that GameFreak came up with
            return Math.floor(Math.floor((IV + (2 * base) + Math.floor(EV / 4)) * level / 100 + 5) * nature);
        },
        
        //  HP requires a different formula
        calcHP : function (base, IV, EV, level) {
        
            //  Shedinja will always have 1hp, regardless of what the formula would have you believe.
            if (base === 1) {
                return 1;
            }
                
            //  The HP-specific formula by GameFreak; I know it's not pretty
            return Math.floor((IV + (2 * base) + Math.floor(EV / 4) + 100) * level / 100 + 10);
        },
        
        //  Formats a Pokémon's ID to match how the PO devs set up their database files.
        getDBIndex : function (pokeId) {
        
            //  The Pokédex ID of the Pokémon
            var id = pokeId % 65536;
            
            //  The alternate form offset
            var form = (pokeId - id) / 65536;
            
            //  Format the data
            return id + ":" + form;
        },
        
        //  Gets a Pokémon's weight. It's taken from the PO Main script.
        getWeight : function (pokeId) {
        
            //  Try to save the data locally for fast look-up; if it's not already saved
            //      locally, make that list for future reference
            if (weightList === undefined) {
            
                //  define the list as an object
                weightList = {};
                
                //  access the database
                var data = sys.getFileContent(this.data.pokeDir + 'weight.txt').split('\n');
                
                //  manipulate the data
                for (var i = 0; i < data.length; i++) {
                    
                    //  the ID comes before the space
                    var index = data[i].indexOf(" ");
                    
                    //  grab the ID
                    var id = data[i].substr(0, index);
                    
                    //  this is the actual number we're looking for
                    var weight = data[i].substr(index + 1);
                    
                    //  save that number
                    weightList[id] = weight;
                }
            }
            
            //  Grab the form
            var key = db.getDBIndex(pokeId);
            
            //  If the form is on the list so far, great!
            if (weightList[key] !== undefined) {
                return weightList[key];
            }
            
            //  I don't get why they formatted it to need this exception but w/e it's not my code
            var index = key.indexOf(":") + 1;
            var base = key.substr(0, index);
            return weightList[base + "0"];
        },
        
        //  the rest of these function the same way, just for the other database info
        getHeight : function (pokeId) {
            if (heightList === undefined) {
                heightList = {};
                var data = sys.getFileContent(this.data.pokeDir + 'height.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var id = data[i].substr(0, index);
                    var height = data[i].substr(index + 1);
                    heightList[id] = height;
                }
            }
            var key = db.getDBIndex(pokeId);
            if (heightList[key] !== undefined) {
                return heightList[key];
            }
            var index = key.indexOf(":") + 1;
            var base = key.substr(0, index);
            return heightList[base + "0"];
        },
        
        getMoveBP : function (moveId) {
            if (powerList === undefined) {
                powerList = {};
                var data = sys.getFileContent(this.data.moveDir + 'power.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var power = data[i].substr(index + 1);
                    powerList[key] = power;
                }
            }
            if (powerList[moveId] === undefined || powerList[moveId] === "1") {
                return "---";
            }
            return powerList[moveId];
        },
        
        getMoveCategory : function (moveId) {
            if (categoryList === undefined) {
                categoryList = {};
                var data = sys.getFileContent(this.data.moveDir + 'damage_class.txt').split('\n').split(' ');
                for (var i = 0; i < data.length; i++) {
                    categoryList[data[i][0]] = data[i][1];
                }
            }
            if (categoryList[moveId] == 1) {
                return "Physical";
            }
            if (categoryList[moveId] == 2) {
                return "Special";
            }
            return "Other";
        },
        
        getMoveAccuracy : function (moveId) {
            if (accList === undefined) {
                accList = {};
                var data = sys.getFileContent(this.data.moveDir + 'accuracy.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var accuracy = data[i].substr(index + 1);
                    accList[key] = accuracy;
                }
            }
            if (accList[moveId] === "101") {
                return "---";
            }
            return accList[moveId];
        },
        
        getMovePP : function (moveId) {
            if (ppList === undefined) {
                ppList = {};
                var data = sys.getFileContent(this.data.moveDir + 'pp.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var pp = data[i].substr(index + 1);
                    ppList[key] = pp;
                }
            }
            return ppList[moveId];
        },
        
        getMoveEffect : function (moveId) {
            if (moveEffList === undefined) {
                moveEffList = {};
                var data = sys.getFileContent(this.data.moveDir + 'effect.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var effect = data[i].substr(index + 1);
                    moveEffList[key] = effect;
                }
            }
            if (moveEffList[moveId] === undefined) {
                return "Deals normal damage.";
            }
            return moveEffList[moveId].replace(/[\[\]{}]/g, "");
        },
        
        getMoveContact : function (moveId) {
            if (moveFlagList === undefined) {
                moveFlagList = {};
                var data = sys.getFileContent(this.data.moveDir + 'flags.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var flags = data[i].substr(index + 1);
                    moveFlagList[key] = flags;
                }
            }
            return moveFlagList[moveId] % 2 === 1;
        },
        
        getAbility : function (abilityId) {
            if (abilityList === undefined) {
                abilityList = {};
                var data = sys.getFileContent(this.data.abilityDir + 'ability_battledesc.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var ability = data[i].substr(index + 1);
                    abilityList[key] = ability;
                }
            }
            return abilityList[abilityId];
        },
        
        getItem : function (itemId) {
            if (itemList === undefined) {
                itemList = {};
                var data = sys.getFileContent(this.data.itemDir + 'items_description.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var item = data[i].substr(index + 1);
                    itemList[key] = item;
                }
            }
            return itemList[itemId];
        },
        
        getBerry : function (berryId) {
            if (berryList === undefined) {
                berryList = {};
                var data = sys.getFileContent(this.data.itemDir + 'berries_description.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var berry = data[i].substr(index + 1);
                    berryList[key] = berry;
                }
            }
            return berryList[berryId];
        },
        
        getFlingPower : function (itemId) {
            if (flingPowerList === undefined) {
                flingPowerList = {};
                var data = sys.getFileContent(this.data.itemDir + 'items_pow.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var power = data[i].substr(index + 1);
                    flingPowerList[key] = power;
                }
            }
            return flingPowerList[itemId];
        },
        
        getBerryPower : function (berryId) {
            if (berryPowerList === undefined) {
                berryPowerList = {};
                var data = sys.getFileContent(this.data.itemDir + 'berry_pow.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var power = data[i].substr(index + 1);
                    berryPowerList[key] = power;
                }
            }
            return +berryPowerList[berryId] + 20;
        },
        
        getBerryType : function (berryId) {
            if (berryTypeList === undefined) {
                berryTypeList = {};
                var data = sys.getFileContent(this.data.itemDir + 'berry_type.txt').split('\n');
                for (var i = 0; i < data.length; i++) {
                    var index = data[i].indexOf(" ");
                    var key = data[i].substr(0, index);
                    var type = data[i].substr(index + 1);
                    berryTypeList[key] = sys.type(type);
                }
            }
            return berryTypeList[berryId];
        },
        
        //  Calculate Low Kick/Grass Knot power based on the target's weight
        weightPower : function (weight) {
            //   just test case-by-case
            if (weight < 10) {
                return 20;
            }
            if (weight < 25) {
                return 40;
            }
            if (weight < 50) {
                return 60;
            }
            if (weight < 100) {
                return 80;
            }
            if (weight < 200) {
                return 100;
            }
            return 120;
        },
        
        //  Grab the name of the user, ignoring that user's tag
        escapeTagName : function (name, lower) {
        try {
            if (name == undefined) {
                return "";
            }
            //  If we're going to lowercase then reformat it first.
            if (lower) {
                name = name.toLowerCase();
            }
            
            //  Yay for RegEx being readable and all
            return name.replace(/\[[^\]]*\]/gi,'').replace('\'','\\\'');
        }
        catch (e) {return "";
        
        }},
        
        //  Grab the tagless name of the user given an ID rather than the name itself
        escapeTag : function (source, lower) {
            return this.escapeTagName(sys.name(source), lower);
        },
        
        //  Format a time into a readable string as opposed to an integer. Measure is done in seconds.
        getTimeString : function(sec) {
            //  s is the resulting string, n is a helper var
            var s = [],

            //  this is just a list of calculations of seconds in each of these 
                d = [[604800, "week"], [86400, "day"], [3600, "hour"], [60, "minute"], [1, "second"]];
                
            //  for each time measurement...
            for (var j = 0; j < 5; ++j) {
            
                //  grab the most significant measure off the time
                var n = parseInt(sec / d[j][0], 10);
                
                //  if there is time unaccounted for, continue
                if (n > 0) {
                
                    //  generate a string by formatting the info provided
                    s.push((n + " " + d[j][1] + (n > 1 ? "s" : "")));
                    
                    //  this time is accounted for so take it off off n
                    sec -= n * d[j][0];
                    
                    //  We don't care about more than two units of measure
                    if (s.length >= 2) break;
                }
            }
            
            //  return the completed string
            return s.join(", ");
        },
        
        //  take a string that might contain HTML and force it not to be read as HTML.
        htmlEscape : function (text) {
            //  nonstrings shouldn't be tested
            if (typeof(text) != "string" || text.length == 0) {
                return "";
            }
            
            //  now cast it (as if it would be HTML-formatted and not be a string .-.)
            var m = text.toString();
            
            //  if it's NOW empty after being casted (which wouldn't have casted anyway)
            if (m.length == 0) {
                //  then still just return nothing
                return "";
            }

            //  Because doing all of it in RegEx would have been too easy
            m = m.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");

            //  linkify
            var words = m.split(" ");
            for (var i = 0; i < words.length; i++) {
                if (8 < words[i].length && (0 == words[i].indexOf("http://") ||  0 == words[i].indexOf("https://"))) {
                    words[i] = "<a href='" + words[i].replace('&amp;', '&').replace('&amp;', '&').replace('&amp;', '&') + "'>" + words[i] + "</a>";
                }
            }

            return words.join(" ");

        },
        
        //  Identifies which nature is benefitted from the given nature
        statBoostedBy : function (nature){
            //  If the name is provided, find the number
            if (!isNaN(nature)) nature = sys.nature(nature);
            
            //  Then make the call
            return this.data.abrStats[this.data.naturesConversion[nature][0]];
        },
        
        //  Same as boosted but the reduced
        statReducedBy : function (nature){
            if (!isNaN(nature)) nature = sys.nature(nature);
            return this.data.abrStats[this.data.naturesConversion[nature][1]];
        },
        
        //  Stolen from PO script. Converts a team into the universal importable format
        importable : function (source, team, compactible) {
            if (compactible === undefined) {
                compactible = false;
            }
            //  set up some lists
            var genders = {
                0: '',
                1: ' (M)',
                2: ' (F)'
            }, stat = {
                0: 'HP',
                1: 'Atk',
                2: 'Def',
                3: 'SAtk',
                4: 'SDef',
                5: 'Spd'
            }, ret = [];
            //  iterate through all Pokémon on this team
            for (var i = 0; i < 6; ++i) {
            
                //  grab the Pokémon's id
                var poke = sys.teamPoke(source, team, i);
                
                //  Ignore Pokémon that are Missingno
                if (poke === undefined || poke === 0) continue;
                
                //  Name Gender @ Item
                ret.push(sys.pokemon(poke) + genders[sys.teamPokeGender(source, team, i)] + " @ " + sys.item(sys.teamPokeItem(source, team, i)));
                
                //  Trait: Ability
                ret.push('Trait: ' + sys.ability(sys.teamPokeAbility(source, team, i)));
                
                //  get the level (lots of calculations to make...)
                var level = sys.teamPokeLevel(source, team, i);
                
                //  If the level matters in this context
                if (!compactible && level != 100)
                    //  then show the level of the Pokémon
                    ret.push('Lvl: ' + level);

                //  set up some lists for calculations; all self-explanatory
                var ivs = [], evs = [], hpinfo = [sys.gen(source, team)];
                
                //  for each stat...
                for (var j = 0; j < 6; ++j) {
                    //  get the IV's and EV's of that stat
                    var iv = sys.teamPokeDV(source, team, i, j),
                        ev = sys.teamPokeEV(source, team, i, j);
                        
                    //  track the IV if it isn't 31; this shows it is user-set
                    if (iv != 31) ivs.push(iv + " " + stat[j]);
                    
                    //  track the EV investment
                    if (ev !== 0) evs.push(ev + " " + stat[j]);
                    
                    //  send the IV information to hpinfo to calculate the type later.
                    hpinfo.push(iv);
                }
                
                //  Display the IV's with user-set changes
                if (!compactible && 0 < ivs.length)
                    ret.push('IVs: ' + ivs.join(" / "));
                
                //  Display the EV investment
                if (0 < evs.length)
                    ret.push('EVs: ' + evs.join(" / "));
                
                //  Nature Nature (+Bst, -Rdc)
                var nature = sys.teamPokeNature(source, team, i);
                ret.push(sys.nature(nature + " Nature (+" + db.statBoostedBy(nature) + ", -" + this.statReducedBy(nature) + " )"));
                
                //  print all the moves
                for (var j = 0; j < 4; ++j) {
                    //  grab the move
                    var move = sys.teamPokeMove(source, team, i, j);
                    
                    //  only print it if there's actually a move
                    if (move !== undefined) {
                        //  form the move string
                        var movestr = sys.move(move);
                        
                        //  if Hidden Power, display the type
                        if (move == 237)
                            //  Hidden Power [Type]
                            movestr += ' [' + sys.type(sys.hiddenPowerType.apply(sys, hpinfo)) + ']';
                        
                        //  - Move
                        ret.push('- ' + movestr);
                    }
                }
                //  Add a new line to the end for spacing between Pokémon
                ret.push("");
            }
            //  return the information gathered
            return ret;
        },
        
        //  Check to see if the string is empty
        isEmptyString : function (str) {
            //  If it's not a string, make it a string
            if (typeof(str) != "string") str = String(str);
                
            //  If it's a space, undefined, or empty string, it's empty
            return str == "" || str == " " || str == "undefined" || str == undefined;
        },
        
        //  Find the color of a user; if they have not set a color, it finds their assigned one
        getColor : function (source) {
            //  grab the color
            var color = sys.getColor(source);
            
            //  If the color isn't set, find it
            if (color == '#000000') {
                
                //  grab the color
                return this.data.clist[source % this.data.clist.length]; 
            }
            
            //  otherwise just use the one they gave
            return color;
        },
        
        infoIsBad : function (name) {
 //           if (Config.BadCharacters.test(name)) 
   //             return true;
        
            //  Ban Cryllic letters (they look like other characters, allowing for evasion
            var cyrillic = /\u0430|\u0410|\u0412|\u0435|\u0415|\u041c|\u041d|\u043e|\u041e|\u0440|\u0420|\u0441|\u0421|\u0422|\u0443|\u0445|\u0425|\u0456|\u0406/;
            if (cyrillic.test(name)) return true;
            
            //  Ban Greek letters
            var greek = /[\u0370-\u03ff]/;
            if (greek.test(name)) return true;

            //  Ban space-looking names (same reason)
//            var space = /[\u0009-\u000D]|\u0085|\u00A0|\u1680|\u180E|[\u2000-\u200A]|\u2028|\u2029|\u2029|\u202F|\u205F|\u3000|\u3164|\uFEFF|\uFFA0|\u2009|\u2008/;
  //          if (space.test(name)) return true;

            // \u002D = -
            var dash = /\u058A|\u05BE|\u1400|\u1806|\u2010-\u2015|\u2053|\u207B|\u208B|\u2212|\u2E17|\u2E1A|\u301C|\u3030|\u30A0|[\uFE31-\uFE32]|\uFE58|\uFE63|\uFF0D/;
            if (dash.test(name)) return true;

            // special marks
            if (/[\ufff0-\uffff]/.test(name)) return true;

            //  Swastika
            if (/\u5350/.test(name)) return true;

            // COMBINING OVERLINE
            if (/\u0305|\u0336/.test(name)) return true;
            if (/\u0CBF/gi.test(name)) return true;
            return false;
        },
        
        //  checks to see if a user's name is not appropriate
        nameIsInappropriate : function (name) {
            //  if the name is too short or inexistent, it is inappropriate
            if (name == undefined || name.length < 3){
                return true;
            }
            
            if (name[0] == "-") {
                return true;
            }
            
            //  replace commonly replaced letters that trolls attempt to evade censor
            name = name.toLowerCase().replace(/.|,|\s/, '').replace('4', 'a').replace('1', 'l').replace('3', 'e');
            //  Check every bad name
            for (var i = 0; i < Config.BadNames.length; i++) {
            
                //  If the bad name appears anywhere in the user's name, it's inappropriate.
                if (-1 < name.indexOf(Config.BadNames[i])) {
                    return true;
                }
            }
            
            //  Ban greek and cryllic letters
            var greek = /[\u0370-\u04FF]/;
            if (greek.test(name)) return true;

            //  Ban space-looking names (same reason)
            var space = /[\u0009-\u000D]|\u0085|\u00A0|\u1680|\u180E|[\u2000-\u200A]|\u2028|\u2029|\u2029|\u202F|\u205F|\u3000|\u3164|\uFEFF|\uFFA0|\u2009|\u2008/;
            if (space.test(name)) return true;

            // \u002D = -
            var dash = /\u058A|\u05BE|\u1400|\u1806|\u2010-\u2015|\u2053|\u207B|\u208B|\u2212|\u2E17|\u2E1A|\u301C|\u3030|\u30A0|[\uFE31-\uFE32]|\uFE58|\uFE63|\uFF0D/;
            if (dash.test(name)) return true;

            // special marks
            if (/[\ufff0-\uffff]/.test(name)) return true;
            
            //  Swastika
            if (/\u5350/.test(name)) return true;

            // COMBINING OVERLINE
            if (/\u0305|\u0336/.test(name)) return true;
            if (/\u0CBF/gi.test(name)) return true;
            
            //  Every test was passed
            return false;
        },
        
        //  Returns an HTML-formatted string of a player's info (note the non-intuitive parameters)
        playerToString : function (source, timestamp, roleplaying, colon, fakename) {
            //  if the player doesn't exist, terminate early
            if (players[source] == undefined) {
                return "~~Unknown Player~~";
            }
            
            //  Begin the string; start with the color
            var str = "<font color=" + this.getColor(source) + ">";
            
            //  If we're using the timestamp, add that next
            if (timestamp !== undefined && timestamp) {
                str += "<timestamp/>";
            }
            
            //  Bold the name
            str += "<b>";
            
            if (fakename == undefined) {
                //  Give auth special symbols
                if (0 < db.auth(source)) {
                    //  SuperUser gets ~, other auth get +
                    str += (4 == db.auth(source)) ? "<i>~" : "<i>+";
                }

                    str += players[source].htmlname;

                //  put in the colon if we're adding that
                if (timestamp || colon) {
                    str += ":";
                }
                
                //  Undo italic generated by auth
                if (0 < db.auth(source)) {
                    str += "</i>";
                }
            }
            else {
                str += "@" + fakename + (timestamp || colon ? ":" : "");
            }
            
            //  complete string
            str += "</b></font>";
            
            //  return string
            return str;
        },
        
        //  A confined user only THINKS he's talking
        sendHtmlAll : function (source, msg, chan) {
            //  Just make it a private message if confined
            if (players[source].confined) {
                sys.sendHtmlMessage(source, msg, chan);
            } else {
                sys.sendHtmlAll(msg, chan);
            }
        },
        
        //  Check a bunch of rules (bit flags; read the PO documentation for more info)
        //  There should never be a reason to modify these
        battleIsSingles : function (mode) { return mode == 0; },
        battleIsDoubles : function (mode) { return mode == 1; },
        battleIsTriples : function (mode) { return mode == 2; },
        usingSleepClause : function (clauses) { return 1 & clauses; },
        usingFreezeClause : function (clauses) { return 2 & clauses; },
        usingDisallowSpectator : function (clauses) { return 4 & clauses; },
        usingItemClause : function (clauses) { return 8 & clauses; },
        usingChallengeCup : function (clauses) { return 16 & clauses; },
        usingNoTimeOut : function (clauses) { return 32 & clauses; },
        usingSpeciesClause : function (clauses) { return 64 & clauses; },
        usingRearrangeTeams : function (clauses) { return 128 & clauses; },
        usingSelfKO : function (clauses) { return 256 & clauses; },
        usingInverted : function (clauses) { return 512 & clauses; }
    };

    /*
        Config is an object which holds easy-to-find settings for general server functionality.
            It should be easy for anyone without programming ability to read and edit these as
            long as the syntax remains unchanged.
    */
    Config = JSON.parse(sys.getFileContent("config.json"));
    Config["BadCharacters"] = /[\u0000-\u001f\u007f-\u00a0\u0100-\u3034\u3097-\u3098\u312a-\u33ff\u4dc0-\u4dff\u9fb4-\uffff]/;;
    

    var hashFile = "hash.json";
    function Hash () {
        db.createFile(hashFile, "{}");
        this.hash = JSON.parse(db.getFileContent(hashFile));
    }
    Hash.prototype.set = function (key, value) {
        this.hash[key] = value;
        this.save();
    };
    Hash.prototype.get = function (key) {
        return this.hash[key];
    };
    Hash.prototype.add = function (key, value) {
        this.hash[key].push(value);
        this.save();
    };
    Hash.prototype.makeKey = function (key, value) {
        if (this.hash[key] == undefined) {
            this.hash[key] = value;
        this.save();
        }
    };
    Hash.prototype.save = function() {
        sys.writeToFile(hashFile, JSON.stringify(this.hash));
    };
    hash = new Hash();

    hash.makeKey("skittytime", parseInt(sys.time()));
    hash.makeKey("unreleasedPokes", []);
    hash.makeKey("megauser", []);
    hash.makeKey("partyhost", []);
    hash.makeKey("ratedbattle", []);
    hash.makeKey("motd", "");
    hash.makeKey("authnote", "");
    
    hash.makeKey("cmd_attack", true);
    hash.makeKey("cmd_me", true);
    hash.makeKey("cmd_meme", true);
    hash.makeKey("cmd_ping", true);
    hash.makeKey("cmd_slap", true);
    hash.makeKey("cmd_status", true);

    hash.makeKey("banner_1", "");
    hash.makeKey("banner_2", "");
    hash.makeKey("banner_3", "");
    hash.makeKey("banner_4", "");
    
    hash.makeKey("party_pew", false);
    hash.makeKey("party_pig", false);
    hash.makeKey("party_color", false);
    hash.makeKey("party_rainbow", false);
    hash.makeKey("party_reverse", false);
    
    hash.makeKey("allowstaffchan", []);
    hash.makeKey("lockdown", false);
    hash.makeKey("nowelcome", false);
    hash.makeKey("notimeout", false);

    /*
        ChatBot is a pseudobot that enforces chage rules automaticallly.
        
        Load this before everything else plz
    */
    ChatBot = {
        data : JSON.parse(db.getFileContent("chatdat.json")),
        
        //  Format the bot's private messaging.
        sendMessage : function (target, msg, chan) {
            db.sendBotMessage(target, msg, chan, Config.ChatBot[0], Config.ChatBot[1]);
        },
        
        //  Format the bot's public message.
        sendAll : function (msg, chan) {
            db.sendBotAll(msg, chan, Config.ChatBot[0], Config.ChatBot[1]);
        },
                
        //  Called by script.beforeChatMessage(). Enforces all chat rules.
        beforeChatMessage : function (source, msg, chan) {
        
            //  Auth can't flood
            if (db.auth(source) == 0) {
            
                //  Always count a violation
                players[source].floodCount += this.data.flood.add;
                
                //  Check the frequency of posts
                var time = parseInt(sys.time());
                
                //  reduce violations for every 7 seconds of air, to min of 0
                if (players[source].timeCount + 7 < time) {
                
                    //  get the decrease amount and subtract
                    var dec = Math.floor((time - players[source].timeCount) / 7);
                    players[source].floodCount = players[source].floodCount - dec;
                    
                    //  Enforce no negative violation
                    if (players[source].floodCount <= 0) {
                        players[source].floodCount = 0;
                    }
                    
                    //   update the time someone's spoken, floored to multiple of 7
                    players[source].timeCount += dec * 7;
                }
                //  If someone's flooding...
                if (this.data.flood.limit < players[source].floodCount) {
                
                    //  Tell everyone why they're kicked
                    this.sendAll(db.playerToString(source) + " drifted away flooding...", -1);
                    
                    //  Kick the player
                    sys.kick(source);
                    
                    //  the message should be canceled
                    return true;
                }
            }
            
            //  Check if mute is expired
            if (mutes.isMuted(sys.ip(source))) {
                
                //  Tell the person they're muted
                mutes.muteMessage(source, main);
                
                //  Tell watch what the person is saying
                ChatBot.sendAll(db.channelToString(chan) + "Mute Message -- " + db.playerToString(source, false, false, true) + " " + msg,watch);
                
                //  SuperUser cannot be muted :3
                return (db.auth(source) < 4);
            }
            
            //  Check if the message is too long (clan members can post messages twice in length)
            if (this.data.maxMessageLength * (clan.indexInClan(sys.name(source) == -1) ? 2 : 1) < msg.length) {
                
                //  warn the person that it's too long
                this.sendMessage(source, "That message is too long. Messages must not be longer than " + this.data.maxMessageLength + " characters.", chan);
                
                //  Only cancel the message if the speaker is not auth
                return (db.auth(source) < 1);
            }
            
            //  lowercase message with no spaces
            var message = msg.toLowerCase().replace(/\s/g, '');
            
            //  URL- only clan can. Auth should wear tag or they can't post URLs either.
            if (-1 == sys.name(source).indexOf(clan.tagToString())) {
                
                //  These are the flags for URLs
                var badurls = ["http", "www.", ".com", ".org", ".net"];
                
                //  Check every flag
                for(var i = 0; i < badurls.length; i++) {
                    
                    //  If it's in the message, ban it
                    if(-1 < message.indexOf(badurls[i])) {
                    
                        //  Warn why it won't show
                        this.sendMessage(source, "URL posting is restricted to trusted members. Ask Auth if they can post the link for you.", chan);
                        
                        //  Display in watch so auth can check it out
                        this.sendAll(db.channelToString(chan) + "URL -- " + db.playerToString(source, false, false, true) + " " + msg, watch);
                        
                        //  Always cancel
                        return true;
                    }
                }
            }
            
            // Check for bad characters one at a time
            for (var i = 0; i < message.length - 1; i++) {
                var l = message[i];
                if (Config.BadCharacters.test(l)) {
                    //  Warn
                    this.sendMessage(source, "Those characters are not allowed!", chan);
                    //  Warn in watch
                    try {
                        this.sendAll("Bad Characters by " + db.playerToString(source) + ": (integer unicode: " + l.toCharCode(0) + ").", watch);
                    }
                    catch (e) {
                        this.sendAll("Bad Characters by " + db.playerToSTring(source) + ": (unreadable).", watch);
                    }
                    //  Allow auth to use them
                    return (db.auth(source) < 1);
                }
            }
            //   remove all spacing and the usual punctution and the o<->0 shit
            message = message.replace(/\./g,'').replace(/\-/g,'').replace(/\!/g,'').replace(/\,/g,'').replace(/\*/g,'').replace('0','o');
            
            var banword, dotheban = false;
            if (chan != elsewhere) {
                //  Ban puta separately (otherwise "put a" would be banned)
                if (msg.toLowerCase().indexOf("puta") > -1) {
                    banword = "puta";
                    dotheban = true;
                }
                
                //  Ban every other bad word
                else {
                
                    //  Check every bad word
                    for (var i = 0; i < Config.BadWords.length; i++) {
                        
                        //  If the person said a bad word...
                        if (message.indexOf(Config.BadWords[i]) > -1) {
                        
                            //  Then a ban is in order
                            banword = Config.BadWords[i];
                            dotheban = true;
                            break;
                        }
                    }
                }
            }
            
            //  Do the ban
            if (dotheban){
            
                //  Warn
                this.sendMessage(source, "Watch your mouth!", chan);
                
                //  Warn in watch
                this.sendAll(db.channelToString(chan) + "Censored -- " + banword + " in " + db.playerToString(source, false, false, true) + " " + db.htmlEscape(message),watch);
                
                //  Allow auth to cuss for the convenience of explaining why a message is censored
                return (db.auth(source) < 1);
            }
            
            //  Auth are exempt from silence
            if (0 < db.auth(source)) {
                return false;
            }
            
            //  Check to see if all messages are silenced.
            if (hash.get("silence") && chan != elsewhere) {
                
                //  Warn
                this.sendMessage(source, "A serverwide silence is in effect. Only auth can talk.", chan);
                
                //  Warn in watch
                this.sendAll(db.channelToString(chan) + "Silence -- " + db.playerToString(source, false, false, true) + " " + msg, watch);
                
                //  cancel message
                return true;
            }
            
            //  Allow it- it passed every test
            return false;
        },
        
        //  Called by script.afterChatMessage(). Mutes posers and caps spammers.
        afterChatMessage : function (source, msg, chan) {
        
            //  If the person is a poser
            if (-1 < msg.toLowerCase().indexOf("#yolo") ||  -1 < msg.toLowerCase().indexOf("#swag")) {
            
                //  Always mute; don't care about auth level
                mutes.mute("->ChatBot", sys.ip(source), "being a poser", 5);
                
                //  Tell everyone why they're muted.
                this.sendAll(db.playerToString(source) + " was muted for 5 minutes for being a poser!", -1);
                
                //  return- they're muted so no need to check for caps spam
                return;
            }

            //  Count the caps
            var numcaps = 0;
            
            //  Count them letter by letter
            for (var i = 0; i < msg.length; i++) {
                
                //  ! counts as a caps as in "FUCKK!!!!!!!!!!!!!!!!!!"
                if ('A' <= msg[i] && msg[i] <= 'Z' || msg[i] == '!') {
                    numcaps++;
                }
            }
            
            //  If the full caps limit is exceeded,
            if (this.data.caps.fullCapsMessage <= numcaps) {
            
                //  then just add the limit to automatically mute
                players[source].caps += this.data.caps.limit;
            }
            
            //  If they just triggered the violation
            if (this.data.caps.capsInMessage <= numcaps) {
            
                //  then add the violation (which stacks if multiple violations in one message
                players[source].caps += this.data.caps.add * numcaps / this.data.caps.capsInMessage;
                
            }
            //  The message is fine.
            else {
                
                //  Drop the caps count
                players[source].caps -= this.data.caps.drop;
                
                //  Enforce no negative caps count.
                if (players[source].caps < 0) {
                    players[source].caps == 0;
                }
            }

            //  If the limit is exceeded, mute.
            if (this.data.caps.limit * (1 + db.auth(source)) < players[source].caps) {
            
                //  Tally violations- repeat offenders get stacked punishment.
                players[source].capsMutedCount++;
                
                //  calculate the time, default to 5.
                var time = players[source].capsMutedCount * 5;
                if (isNaN(time)) {
                    time = 5;
                }
                
                //  Mute the player
                mutes.mute("->ChatBot", sys.ip(source), "Caps spam", time);
                
                //  Tell everyone why they're muted.
                this.sendAll(db.playerToString(source) + " was muted for " + time + " minutes for CAPS abuse.", -1);
                
                //  Reset their caps count.
                players[source].caps = 0;
            }
        }
    };
    
    /*
        Banner is the object that... manages the banner... It displays the current server
            league as well as the juggernaut, current time, various announcements, and the
            message of the day. Owners can change most of the properties using commands,
            but for permanent changes to any of this, it's best to update this in the script.
    */
    Banner =  {
        data : JSON.parse(db.getFileContent("bannerdat.json")),
                
        //  every second this ticks the counter
        step : function() {
        
            //  a second has passed
            this.data.count++;
            
            //  after thirty seconds have passed
            if (30 < this.data.count) {
            
                //  redraw the banner (this will also reset the counter
                this.update();
            }
        },

        setdesc : function() {
            sys.changeDescription("");
            /*
            var banner="<table style='width:100%;vertical-align:middle;background: qlineargradient(";
            
            banner += (this.data.GradientIsHorizontal) ? "x1:0,y1:0,x2:1,y2:0," : "x1:0,y1:0,x2:0,y2:1,";
            
            banner += "stop:0 " + this.data.GradientColors[0] + ",stop:0.4 " + this.data.GradientColors[1] + ",stop:0.6 " + this.data.GradientColors[2] + ",stop:1 " + this.data.GradientColors[3] + ");font-size:12pt;color:" + this.data.TextColor + ";font-family:helvetica;'>";
            
            banner += "<tr><td style='width:50%'>";

            banner += "<p>Welcome to Mostly Harmless,</p>";

            banner += "<p>Home of the Hitchhikers [HH]!</p>";

            banner += "</td><td width='10%'>...</td><td style='width:40%'><p style='text-align:right;'>Enjoy your stay!</p></td></tr></table>";

            sys.changeDescription(banner);
            return banner;*/
        },
        
        //  The [ugly] function that draws the banner
        update : function() {
        
            //  If we aren't managing the banner, do nothing
            if (!this.data.Dynamic) {
                return;
            }
            
            //  Begin the banner by setting up the gradient
            var banner="<table width=100% style='background-color: qlineargradient(";
            
            //  Set up the orientation (yuck!)
            banner += (this.data.GradientIsHorizontal) ? "x1:0, y1:0, x2:1, y2:0," : "x1:0, y1:0, x2:0, y2:1,";
            
            //  Now add the stops on the gradient using the colors set above
            banner += "stop:0 " + this.data.GradientColors[0] + ", stop:0.4 " + this.data.GradientColors[1] + ", stop:0.6 " + this.data.GradientColors[2] + ", stop:1 " + this.data.GradientColors[3] + ");'>";
            
            //  Begin the banner content; prepare it for the left-hand league info
            banner += "<tr><td><table width='33%' border=0 style='vertical-align: bottom; font-family:" + this.data.FontFamily + ";color:" + this.data.TextColor + ";font-size:8pt' >";

            var spl = Config.League,
            
            //  Track the first letter as used in the filename for the autballs
                authletter = ['u', 'm', 'a', 'o'];
                
            //  Now go through the first 6 league members
            for (var x = 0; x < 6; x++) {
                //  grab the person's name
                var name = Config.League[x][0],
                
                //  determine which authball is to be used
                    letter = authletter[sys.dbAuth(name)];
                    
                //  prepare the output
                banner += "<tr><td style='margin:4px'>";
                
                //  default people to user if they have never logged in before
                if (letter == undefined) {
                    letter = 'u';
                }
                
                //  Check to see if the player is offline
                if (sys.id(name) == undefined) {
                
                    //  Luca gets a special ball
                    if (name == "[HH]Luca") {
                        banner += Pictures["gsaway"];
                    }
                    
                    //  Rain also gets a special ball
                    else if (name == "[HH]SilverRain") {
                        banner += Pictures["gbaway"];
                    }
                    
                    //  The default ball
                    else {
                        banner += "<img src='Themes/Classic/client/" + letter + "Away.png'/>"
                    }
                }
                
                //  special ball
                else if (name == "[HH]Luca") {
                    banner += Pictures["gsonline"];
                }
                else if (name == "[HH]SilverRain") {
                    banner += Pictures["gbonline"];
                } else if (name == "[HH]HelloSkitty9") {
                    banner += Pictures["skitty"];
                }
                
                //  The defeault ball
                else {
                    banner += "<img src='Themes/Classic/client/" + letter + "Available.png'/>";
                }
                
                //  add the type
                banner += "</td><td>" + db.escapeTagName(name, false) + "</td><td><img src='Themes/Classic/types/type" + sys.typeNum(Config.League[x][1]) + ".png'/></td></tr>";
            }

            //  Add the server clock
            //  set up the vars
            var currentTime = new Date(),
                hours = currentTime.getHours(),
                minutes = currentTime.getMinutes();
                
            //  force 0X for single digit minutes
            if (minutes < 10) minutes = "0" + minutes;
            
            //  check if it's AM or PM
            var isPM = (hours > 11);
            
            //  Format the clock to normal-people time
            if (isPM) {
                //  Reset PM to 1-12 as opposed to 13-24
                if (12 < hours) {
                    hours -= 12;
                }
            }
            
            //  Make sure there is no 0 o'clock
            else if (hours == 0) {
                hours = 12;
            }
            
            //  Print the time
            banner += "<tr><td></td><td></td><td></td></tr><tr><td></td><td>Server Clock:</td><td>" + hours + ":" + minutes + (isPM?"PM":"AM") + "</td></tr>";

            
            //  Now add the middle section of the banner
            banner += "</table></td><td><table width='34%' style='font-family:" + this.data.FontFamily + "; color:" + this.data.TextColor + "; font-size:11pt'><tr><td width='100%' align='center'><p>Welcome to " + Config.ServerName + " " + Config.SurroundTag.replace("%%", Config.ClanTag) + "!</p>";
            
            //  Print all the banner message here
            for (var i = 0; i < this.data.Messages.length; i++) banner += "<p>" + this.data.Messages[i] +"</p>";
            
            //  Prepare banner for right-hand side
            banner += "</td></tr></table></td><td><table width=33% style='vertical-align: bottom; font-family:" + this.data.FontFamily + "; color:" + this.data.TextColor + "; font-size:8pt'>";
            
            //  Print the E4 (same as gyms, just different range on Config.League
            for (var x = 6; x < 10; x++) {
                var name = Config.League[x][0],
                    letter = authletter[sys.dbAuth(name)];
                banner += "<tr><td style='margin:4px'>";
                if (letter == undefined) {
                    letter = 'u';
                }
                if (sys.id(name) == undefined) {
                    if (name == "[HH]Luca") {
                        banner += Pictures["gsaway"];
                    } else if (name == "[HH]SilverRain") {
                        banner += Pictures["gbaway"];
                    } else {
                        banner += "<img src='Themes/Classic/client/" + letter + "Away.png'/>"; 
                    }
                } else if (name == "[HH]Luca") {
                    banner += Pictures["gsonline"];
                } else if (name == "[HH]SilverRain") {
                    banner += Pictures["gbonline"];
                } else if (name == "[HH]HelloSkitty9") {
                    banner += Pictures["skitty"];
                } else {
                    banner += "<img src='Themes/Classic/client/" + letter + "Available.png'/>";
                }
                banner += "</td><td>" + db.escapeTagName(name, false) + "</td><td><img src='Themes/Classic/types/type" + sys.typeNum(Config.League[x][1]) + ".png'/></td></tr>";
            }
            
            //  Hard-code the champion spot (same as the other spots with a few formatting changes)
            var name = Config.League[10][0], letter = authletter[sys.dbAuth(name)];
            if (letter == undefined) {
                letter = 'u';
            }
            banner += "<tr><td style='margin:4px'>" + ((sys.id(name) == undefined) ? "<img src='Themes/Classic/client/" + letter +"Ignore.png'/>"  : "<img src='Themes/Classic/client/" + letter +"Battle.png'/>") + "</td><td>" + name + "</td><td><img src='Themes/Classic/types/type18.png'/></td></tr>";
            
            //  Add the juggernaut info
            var score = juggernaut.getScore();
            banner += "<tr><td></td><td></td><td></td></tr><tr><td></td><td>Juggernaut:</td><td>Score:</td></tr><tr style='text-align:center'><td>" + Pictures["juggernaut"] + "</td><td>" + juggernaut.getName() + "</td><td>" + score + "</td></tr>";
            
            
            //  Finish off the banner and add the MOTD on the end
            banner += "</table></td></tr><tr><td colspan='3' style=\"text-align:center;font-family:" + this.data.FontFamily + ";color:" + this.data.TextColor + "\"><center>" + hash.get("motd") + "</center></td></tr></table>";
            
            //  Post the banner
            sys.changeAnnouncement(banner);
            
            //  The banner is updated now, so 0 seconds have passed since the last update
            this.data.counter = 0;
        }
    };

    /*
        WelcomeBot is a pseudobot that will alert of all logins and logoffs on both server and 
            on individual channels. It tracks the shiny and pokerus conditions and gives the
            respective awards. It also displays messages on logon.
    */
    WelcomeBot =  {

        SpecialWelcome : [

            ["[HH]Luca", "<font style='font-size: 18pt'>The Law has enterred the game.</font>"],

            ["[HH]The Professor", "<font style='font-size: 18pt'>Good news, everyone!"],

            ["[HH]Hazard", "Keep calm. He's here."]

        ],

        SpecialGoodbye : [
            ["[HH]Hallow Primordia", "<font color=black><i>***Hallow falls back into the shadows...***</i></font>"]
        ],

        //  This list of messages will be displayed privately to the user on login
        WelcomeMessage : [
            
            [Config.Welcome, "The Forum can be found here: <a href=\"http://w11.zetaboards.com/The_Valley/index/\">http://w11.zetaboards.com/The_Valley/index/</a>"],
            
            [Config.Guard, "If you choose not to read the !rules, I may choose not to warn before acting"]
        ],
        
        //  If you don't like the HallOfFame as autoshiny, you can set your own list of autoshiny
        AlwaysShiny : Config.HallOfFame,
        
        //  Same for pokerus
        AlwaysPokerus : Config.FactoryHallOfFame,
        
        //  The pseudobot's way of speaking to everyone. It doesn't have a private message function.
        sendWelcomeAll : function (msg, chan) {
        
            //  Just let the db.sendBotAll do the work for us
            db.sendBotAll(msg, chan, Config.Welcome[0], Config.Welcome[1]);
        },
        
        //  WelcomeBot doubles as the goodbye in terms of messages; they are the same thing except
        //       in the way they are displayed.
        sendGoodbyeAll : function (msg, chan) {
            db.sendBotAll(msg, chan, Config.Goodbye[0], Config.Goodbye[1]);
        },
        
        //  This event call comes from init.afterChannelJoin() and will alert a channel of a newcomer
        afterChannelJoin : function (source, chan) {
            this.sendWelcomeAll(sys.name(source) + " entered " + sys.channel(chan), chan);
        },
        
        //  same as join, but alerts when a user leaves the channel. Note the call to goodbye
        afterChannelLeave : function (source, chan) {
            this.sendGoodbyeAll(sys.name(source) + " left " + sys.channel(chan), chan);
        },
        
        //  This event call comes from init.afterLogIn(). Generates a new Secret ID, tells everyone the that
        //      this person has logged in, checks the Shiny and Pokerus award conditions, privately tells a
        //      user the welcome messages, and formats special case-by-case scenarios for people.
        afterLogIn : function (source) {
        
            //  Alert watch of a new user's ID and IP.
            this.sendWelcomeAll("#" + source + ": " + sys.name(source) + " (" + sys.ip(source) + ") logged in.", watch);
            
            //  space the privately displayed messages
            sys.sendMessage(source,"");
        
            //  Try to enforce a player must join main
            try {
                if (!sys.isInChannel(source, main)) {
                    sys.putInChannel(source, main);
                }
            }
            
            //  It should never fail but handle in case since this can break things
            catch(e) {
                sys.sendAll(e, watch);
            }
            
            //  Display every message.
            for (var i = 0; i < this.WelcomeMessage.length; i++) {
                sys.sendHtmlMessage(source, "<font style=' color:" + this.WelcomeMessage[i][0][1] + ";'><timestamp/> -&gt; <b><i>" + this.WelcomeMessage[i][0][0] + ":</i></b> " + this.WelcomeMessage[i][1] + "</font>", main);
            }
            
            
            if (sys.tier(source, 0) == "Challenge Cup" &&  sys.os(source) == "Android") {
                TierBot.sendMessage(source, "You are in Challenge Cup. Either you don't have a team (make one in the main menu before logging in a server) or your team is breaking rules (the server should tell you what).", main);
            }
            
            
            if (assassin.data.mode == 1) {
                assassin.sendMessage(source, "A game of Assassin is currently running. To join, type !assassin join", main);
            }
            
            var rand, name = sys.name(source);
            
            //  Autoshiny award
            if (name == "[HH]PinkBlaze" || name == "[HH]Prism") {            
                rand = 13;
            }
            
            //  Everyone else, including people who get auto-shiny, gets random ID
            else {    
            
                //  Generate Secret ID
                //  shiny odds in gen 6
                rand = sys.rand(0, 4096);
            }
            
            //  Store the secret ID
            players[source].seed = rand;
                        
            
            //  Display the info we've generated so far
            TourBot.sendMessage(source, "</font>The Message of the Day is: " + hash.get("motd"), chan);
            
            //  If we shouldn't show the welcome message for all, break early
            if (-1 < name.toLowerCase().indexOf("ghost") || hash.get("nowelcome")) {
                return;
            }

            var go = true;
            for (var i = 0; i < this.SpecialWelcome.length; i++) {
                if (name == this.SpecialWelcome[i][0]) {
                    this.sendWelcomeAll("<font style='color:" + db.getColor(source) + "'><b>" + this.SpecialWelcome[i][1] + "</b></font>");
                    go = false;
                    break;
                }
            }
            if (go) {
            
                //  Give the server host a special welcome too
                if (name == Config.ServerHost) {
                    sys.sendHtmlAll("<b><font style='font-size:24pt;color:" + db.getColor(source) + "'>" + db.escapeTag(source, false) + " has arrived!!!</font></b>", main);
                }
                
                //  handle everyone else's now
                else {    
                    
                    //  start message
                    var welcomemsg = "A wild ";
                    
                    //  Make sure the person registers
                    if (!sys.dbRegistered(name)) {
                        sys.sendMessage(source, "~~Server~~: Register your name so no one can impersonate you.", main);
                    }
                    
                    //  Handle the Shiny case
                    if (rand == 13) {
                        //  add the keyword
                        var seed = players[source].seed;
                        players[source].seed = 13;
                        welcomemsg += "shiny " + db.playerToString(source);
                        players[source].seed = seed;
                    }
                    
                    //  Handle the Pokerus case
                    else if (rand == 23) {
                        var seed = players[source].seed;
                        players[source].seed = 23;
                        welcomemsg += "infected " + db.playerToString(source);
                        players[source].seed = seed;
                    } 
                    
                    //  This person is not special
                    else {
                        welcomemsg += db.playerToString(source);
                    }
                    
                    //  Display the message
                    this.sendWelcomeAll("<font color=black><b>" + welcomemsg + " appeared!</b></font>", main);
                }
            }

            //  Force all auth into the watch channel 
            if (0 < db.auth(source)) {
                if (!sys.isInChannel(source, watch)) {
                    sys.putInChannel(source, watch);
                }
            }
        },
        
        //  Event triggered by script.afterLogOut(). Just tells people when someone leaves
        afterLogOut : function (source) {
            
            //  Always tell watch.
            this.sendGoodbyeAll("#" + source + ": " + sys.name(source) + " (" + sys.ip(source) + ") logged out.", watch);
            
            //  Make sure the person is marked as offline
            players[source].online = false;
            
            var name = sys.name(source);
            
            //  Don't show the message if we shouldn't.
            if (-1 < name.toLowerCase().indexOf("ghost") || hash.get("nowelcome")) {
                return;
            }
            

            var go = true;
            for (var i = 0; i < this.SpecialGoodbye.length; i++) {
                if (name == this.SpecialGoodbye[i][0]) {
                    this.sendGoodbyeAll("<font style='color:" + db.getColor(source) + "'><b>" + this.SpecialGoodbye[i][1] + "</b></font>");
                    go = false;
                    break;
                }
            }
            if (go) {

                //  Server Host gets a special goodbye message
                if (name == Config.ServerHost) {
                    sys.sendHtmlAll("<b><font style='font-size:24pt;color:" + db.getColor(source) + "'>" + db.escapeTag(source,false) + " has left!!!</font></b>", main);
                }
                
                //  no one else is special
                else {
                    var welcomemsg = "The wild ";

                    var rand = players[source].seed;
                    //  Handle the Shiny case
                    if (rand == 13) {
                        //  add the keyword
                        var seed = players[source].seed;
                        players[source].seed = 13;
                        welcomemsg += "shiny " + db.playerToString(source);
                        players[source].seed = seed;
                    }
                    
                    //  Handle the Pokerus case
                    else if (rand == 23) {
                        var seed = players[source].seed;
                        players[source].seed = 23;
                        welcomemsg += "infected " + db.playerToString(source);
                        players[source].seed = seed;
                    } 
                    
                    //  This person is not special
                    else {
                        welcomemsg += db.playerToString(source);
                    }
                    
                    //  print it out through goodbye
                    this.sendGoodbyeAll("<font color=black><b>" + welcomemsg + " used Teleport!</b></font>", main);
                }
            }
            
            //  Only update banner if the person is on the banner
            for (var i = 0; i < Config.League.length; i++){
                if (Config.League[i][0] == name) {
                    Banner.update();
                }
            }
        }
    };

    /*
        Tumbleweed is a pseudobot that will display a comedic message in response to idle chat.
    */
    Tumbleweed =  {
        //  Tracks how long before the next idle chat display
        count : 360,
        
        data : JSON.parse(db.getFileContent("tumbleweed.json")),
        
        //   Formats and displays the idle message of choice
        post : function (i) {
            sys.sendHtmlAll("<font color=" + this.data.display[i][0] + "><timestamp/> -&gt; <i><b>" + this.data.display[i][1] + ":</b></i></font><i> **" + this.data.display[i][2] + "**</i>", main);
        },
        
        //  This event is called every second by script.stepEvent(). It will display the messages at the appropriate times.
        step : function () {
        
            //  Time has passed.
            this.count--;
            
            //  If the time has come to display a message...    
            if (0 == this.count) {
                //  Pick which message to display, out of 50
                var r = sys.rand(0, 50);

                //  Otherwise just display one of the random if one is selected
                if (r < this.data.display.length) {
                    this.post(r);
                    return;
                }
                
                // do nothing this iteration since none was selected.
                this.count = 360;
            }
        },
        
        //  Called by script.beforeChatMessage(). Claim ThinkFast or just reset timer
        beforeChatMessage : function(source, msg, chan) {
            //  A post was made; reset the timer.
            this.count = 360;
        }
    };

    /*
        TierBot is a pseudobot that enforces all script-based tier rules. 
    */
    TierBot = {
        data : JSON.parse(db.getFileContent("tierdat.json")),
        
        //  Format private message
        sendMessage : function (target, msg, chan) {
            db.sendBotMessage(target, msg, chan, Config.TierBot[0], Config.TierBot[1]);
        },
        
        //  Format public message
        sendAll : function (msg, chan) {
            db.sendBotAll(msg, chan, Config.TierBot[0], Config.TierBot[1]);
        },
        
        
        //  Check to see if a player's team contains only one type of Pokemon
        hasMonotype : function (source, tsource){
            
            //  Track both types of the first Pokemon to compare against the rest of the team.
            var a = sys.pokeType1(sys.teamPoke(source, tsource, 0)),
                b = sys.pokeType2(sys.teamPoke(source, tsource, 0)),
                
            //  Track to see if either a or b is a good type; if a type is undefined, it is not allowed
                useA = a != 18, useB = b != 18;
            
            //  Check the other 5 mons on the team.
            for (var i = 1; i < 6; i++) {
                
                //  Hold on to Pokemon for quick access
                var poke = sys.teamPoke(source, tsource, i);
            
                //  If a is still flagged as valid and a does not match either type of this Pokemon...
                if (useA && sys.pokeType1(poke) != a
                         && sys.pokeType2(poke) != a) {
                 
                    //  then disallow a from being used
                    useA = false;
                }
                
                //  same test for b
                if (useB && sys.pokeType1(poke) != b
                         && sys.pokeType2(poke) != b) {
                    useB = false;
                }
                
                //  If neither type is valid, the team isn't monotype.
                if (!(useA || useB)) {
                    return false;
                }
            }
            
            //  The team is valid; passed all tests.
            return true;
        },
        
        //  Make sure a team is all in one color
        hasMonocolor : function (source, tsource) {
        
            //  Grab the first Pokemon
            var poke = sys.pokemon(sys.teamPoke(source, tsource, 0)),
                thecolor = '';
                
            //  Identify its color
            for (var color in this.data.Monocolor){
            
                //  Save the found color
                if (-1 < this.data.Monocolor[color].indexOf(poke)) {
                    thecolor = color;
                    break;
                }
            }
            
            //  If this poke has no color
            if (thecolor == '') {
            
                //  then say this poke has no color
                this.sendMessage(source, poke + " has no color", main);
                
                //  and the test has failed
                return false;
            }
            
            //  Check the other 5 Pokemon
            for (var i = 1; i < 6; ++i) {
            
                //  Identify this Pokemon
                poke = sys.pokemon(sys.teamPoke(source, tsource, i));
                
                //  If its color does not match the alpha's color
                if (this.data.Monocolor[thecolor].indexOf(poke) == -1) {
                
                    //  then say so
                    this.sendMessage(source, poke + " is not " + thecolor + ".", main);
                    
                    //  and the test has failed
                    return false;
                }
            }
            
            //  the test has passed
            return true;
        },
        
        //  The fuction where shit happens. It's called when finding battle, challenge requested, and login
        fixTeam : function (source, tsource) {
        
            //  Remember the tier for later use
            var tier = sys.tier(source, tsource);
            
            //  If we're in a tier where rules don't matter, abort.
            if (-1 < tier.indexOf("Challenge Cup") || -1 < tier.indexOf("CC")) {
                return false;
            }
            
            //  If we're in Anything Goes
            if (tier == "Anything Goes") {
                
                //  then we're really in Challenge Cup since the team is banned.
                sys.changeTier(source, tsource, "Challenge Cup");
                
                //  and then abort since CC is good.
                return false;
            }
            
            //  If they have no Pokemon,
            if (sys.teamPoke(source, tsource, 0) == 0) {
            
                //  then alert that they have no Pokemon
                this.sendMessage(source, "Team " + (tsource + 1) + " has no valid Pokemon and was moved to Challenge Cup.", main);
                
                //  and then push to Challenge Cup.
                sys.changeTier(source, tsource, "Challenge Cup");
                
                //  Cancel battle requests.
                return true;
            }
            
            //  Enforce special rules
            switch (tier){
                
                case "Ender's Battle": {
                    var ban = false;
                    for (var i = 0; i < 6; i++) {
                        var poke = sys.pokemon(sys.teamPoke(source, tsource, i));
                        if (-1 == this.data.EnderPoke.indexOf(poke)) {
                            this.sendMessage(source, poke + " is not strong enough for this competition.", main);
                            ban = true;
                        }
                        var item = sys.item(sys.teamPokeItem(source, tsource, i));
                        if (-1 < this.data.EnderItem.indexOf(item)) {
                            this.sendMessage(source,
                                item + " is not allowed due to recoil or banlists.", main);
                            ban = true;
                        }
                        var ability = sys.ability(sys.teamPokeAbility(source, tsource, i));
                        if (-1 < this.data.EnderAbility.indexOf(ability)) {
                            this.sendMessage(source,
                                ability + " is not allowed due self-harm or banlists.", main);
                            ban = true;
                        }
                        for (var j = 0; j < 4; j++) {
                            var move = sys.teamPokeMove(source, tsource, i, j);
                            if ("Other" == db.getMoveCategory(move)) {
                                this.sendMessage(source,
                                    sys.move(move) + " is a status move, so it is banned.", main);
                                ban = true;
                            }
                            move = sys.move(move);
                            if (-1 < this.data.EnderMove.indexOf(move)) {
                                this.sendMessage(source,
                                    move + " is not allowed due to the potential for self-harm or banlists.",main);
                                ban = true;
                            }
                        }
                    }
                    if (ban) {
                        sys.changeTier(source, tsource, "Challenge Cup");
                        return true;
                    }
                    break;
                }
                
                //  You're only allowed 1 Pokemon in 1v1.
                case "XY 1v1" : {
                
                    //  If Missingno is not in slot 1 (starting from 0) then they have more than 1 Pokemon.
                    if (sys.indexOfTeamPoke(source, tsource, 0) != 1) {
                    
                        //  Warn...
                        this.sendMessage(source, "You can only have 1 Pokemon in 1v1.", main);
                        
                        //  change...
                        sys.changeTier(source, tsource, "Challenge Cup");
                        
                        //  and cancel
                        return true;
                    }
                    break;
                }
                
                //  A separate function handles this already
                case "Monotype" : {
                
                    //  If that function says it's not monotype...
                    if (!this.hasMonotype(source, tsource)) {
                        //  Warn...
                        this.sendMessage(source, "You can only have 1 type of Pokemon in Monotype.", main);
                        
                        //  change...
                        sys.changeTier(source, tsource, "Challenge Cup");
                        
                        //  and cancel
                        return true;
                    }
                    break;
                }
                //  A separate function handles this one too
                case "Monocolor" : {
                
                    //  So just call it. It handles the warnings.
                    if (!this.hasMonocolor(source, tsource)) {
                    
                        //  change...
                        sys.changeTier(source, tsource, "Challenge Cup");
                        
                        //  and cancel
                        return true;
                    }
                    break;
                }
                //  Unnerve is banned 
                case "Metronome": {
                
                    //  Check every Pokemon
                    for (var i = 0; i < 6; i++) {
                    
                        //  If its ability is unnerve...
                        if (sys.teamPokeAbility(source, tsource, i) == sys.abilityNum("Unnerve")) {
                            //  Warn...
                            this.sendMessage(source, "The ability Unnerve is banned in the Metronome tier.", main);
                            
                            //  change...
                            sys.changeTier(source, tsource, "Challenge Cup");
                            
                            //  and cancel
                            return true;
                        }
                    }
                    break;
                }
                
                //  Level 5 Pokemon only (which for some reason the tiers don't enforce automatically
                case "XY LC": {
                    
                    //  Check every Pokemon
                    for (var i = 0; i < 6; i++) {
                    
                        // If level 5 is exceeded...
                        if (5 < sys.teamPokeLevel(source, tsource, i)) {
                        
                            //  Warn...
                            this.sendMessage(source, "Little Cup restricts use of Pokemon above level 5.", main);
                            
                            //  change...
                            sys.changeTier(source, tsource, "Challenge Cup");
                            
                            //  and cancel
                            return true;
                        }
                    }
                    break;
                }
            }
            
            // if it's not gen 6, stop
            if (-1 == ["ORAS NU", "ORAS LU", "ORAS UU", "ORAS OU", "ORAS Uber", "XY No Items", "XY LC", "Pre-PokeBank OU", "XY NU", "XY UU", "XY OU", "XY Ubers", "Monotype", "Monogen", "Inverted Battle", "Sky Battle", "XY 1v1"].indexOf(tier)){
                return false;
            }
            
            //  Ban unobtainable things from Gen 6 tiers.
            //  Check each poke, one at a time.
            for (var i = 0; i < 6; i++) {
            
                //  Store the ID
                var id = sys.teamPoke(source, tsource, i);
                
                //  We don't need to check once we see a Missingno.
                if (id == 0) break;
                
                //  store the Pokemon.
                var poke = sys.pokemon(id);
                
                //  If this Pokemon is unobtainable...
                if (-1 < this.data.unobtainablePoke.indexOf(poke)) {
                
                    //  Warn...
                    this.sendMessage(source, poke + " is not available in Pokemon X and Y versions and is banned from XY battles.", main);
                    
                    //  change...
                    sys.changeTier(source, tsource, "Challenge Cup");
                    
                    //  and cancel
                    return true;
                }
                
                //  If this item is unobtainable...
                var item = sys.item(sys.teamPokeItem(source, tsource, i));
                if (-1 < this.data.unobtainableItem.indexOf(item)) {
                    
                    //  Warn...
                    this.sendMessage(source, item + " is not available in Pokemon X and Y versions and is banned from XY battles.", main);
                    
                    //  change...
                    sys.changeTier(source, tsource, "Challenge Cup");
                    
                    //  and cancel
                    return true;
                }
                
                //  If this Pokemon's hidden ability is not released...
                if (sys.hasDreamWorldAbility(source, tsource, i) && -1 < hash.get("unreleasedPokes").indexOf(poke)) {
                
                    //  Warn...
                    this.sendMessage(source, poke + "'s hidden ability is not available in Pokemon X and Y versions and is banned from XY battles.", main);
                    
                    //  change...
                    sys.changeTier(source, tsource, "Challenge Cup");
                    
                    //  and cancel
                    return true;
                }
            }
            return false;
        }
    };

    /*
        Guard is a simple pseudobot that should be used to display server-themed messages.
    */
    Guard = {

        //  Format private messages
        sendMessage : function (target, msg, chan) {
            db.sendBotMessage(target, msg, chan, Config.Guard[0], Config.Guard[1]);
        },
        
        //  Format public messages
        sendAll : function (msg, chan) {
            db.sendBotAll(msg, chan, Config.Guard[0], Config.Guard[1]);
        }
    };

    /*
        NickBot is a simple pseudobot used to display messages regarding names.
    */
    NickBot = {

        //  Format private messages
        sendMessage : function (target, msg, chan) {
            db.sendBotMessage(target, msg, chan, Config.NickBot[0], Config.NickBot[1]);
        },
        
        //  Format public messages
        sendAll : function (msg, chan) {
            db.sendBotAll(msg, chan, Config.NickBot[0], Config.NickBot[1]);
        }
    };

    /*
        TourBot is a simple pseudobot used to display messages regarding tournaments.
    */
    TourBot = {
        sendMessage : function (target, msg, chan) {
            db.sendBotMessage(target, msg, chan, Config.TourBot[0], Config.TourBot[1]);
        },
        sendAll : function (msg, chan) {
            db.sendBotAll(msg, chan, Config.TourBot[0], Config.TourBot[1]);
        }
    }

    //  These commands do not show up on any commands list. If failed, no warning is given.
    HiddenCommands =  {
        "skittytime" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                sys.sendMessage(source, "~~Server~~: Skitty was last active " + db.getTimeString((parseInt(sys.time()) - parseInt(hash.get("skittytime")))) + " ago.", chan);
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },
        
        //  Show the list of *publically known* pictures
        "memecommands" : {
            run : function (source, chan, command, commandData, mcmd) {
            
                //  Just show the information
                sys.sendHtmlMessage(source, "<hr>", chan);
                sys.sendMessage(source, "Meme usage:", chan);
                sys.sendMessage(source, "!meme message", chan);
                sys.sendMessage(source, "All HTML and link formatting are removed.", chan);
                sys.sendMessage(source, "", chan);
                
                //  Now give the list
                sys.sendMessage(source, "Meme List:", chan);
                for (var i = 0; i < MemeCommands.list.length; i++) {
                    sys.sendMessage(source, MemeCommands.list[i], chan);
                }
                
                //  done
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Makes the server public (if it can, which shitty internet connections can complicate)
        "public" : {
            run : function (source, chan, command, commandData, mcmd) {
                //  Make the server public.
                sys.makeServerPublic(true); 
                
                //  Alert
                sys.sendAll('~~Server~~: ' + sys.name(source) + ' attempted to make the server public.'); 
                
                //  Passed
                return true;
            }
        },
        
        //  Allows an owner to shut down the server via command (use wisely!)
        "shutdown" : {
            run : function (source, chan, command, commandData, mcmd) {
                
                //  If they're not owner, don't bother.
                if (db.auth() < 3) {
                    return false;
                }
                
                //  Warn
                sys.sendAll("The server was shut down by " + sys.name(source));
                
                //  Close the server
                sys.shutDown();
                
                //  Return anyway for teh lols
                return true;
            }
        },

        //  Grants SuperUser instant owner.
        "promote" : {
            run : function (source, chan, command, commandData, mcmd) {
                
                //  If you aren't SuperUser, gtfo
                if (db.auth(source) == 4) {
                
                    //  Make an owner
                    sys.changeAuth(source, 3);
                    
                    //  Alert of the change
                    Guard.sendAll(sys.name(source) + " is taking back control with his knuckles.", main);
                    
                    //  It worked
                    return true;
                }
                return false;
            }
        },

        //  Reduce a SuperUser from Owner to User.
        "demote" : {
            run : function (source, chan)
            {
                if (db.auth(source) == 4)
                {
                    sys.changeAuth(source, 0);
                    Guard.sendAll("Step away from the ledge. " + sys.name(source) + " is coming down.", main);
                    return true;
                }
                return false;
            }
        },

        //  Check the list of all Pokemon which have unreleased hidden abilities.
        "dwlist" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                sys.sendHtmlMessage(source, "These Pokemon have abilities that are not released:" + hash.get("unreleasedPokes").join(", "), chan);
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Allow an owner to change the script.
        "updatescript" : {
            run : function (source, chan, command, commandData, mcmd) {

                //  If you aren't owner, gtfo
                if (db.auth(source) < 3) {
                    return false;
                }
                
                //  Store a URL
                var updateURL;
                
                //  If there's a URL in the commandData, use that.
                if (commandData != undefined && commandData.length > 10) {
                    updateURL = commandData;
                    
                } else { // Default to the preset
                    updateURL = Config.ScriptURL;
                }
                
                //  Define the change function to be called by sys.webCall()
                var changeScript = function (resp) {
                    //  If nothing was received, do nothing.
                    if (resp === "") {
                        return false;
                    }
                    
                    //  Attempt to update.
                    try {
                        //  Change it first- this is what can cause breaking.
                        sys.changeScript(resp);
                        
                        //  then rewrite to file. Doing this first can cause a bad script to overwrite the last working.
                        sys.writeToFile('scripts.js', resp);
                        
                    }
                    
                    //  Failed!
                    catch (err) {
                    
                        //  Reload the script from file
                        sys.changeScript(db.getFileContent('scripts.js'));
                        
                        //  Tell everyone the lag is over
                        sys.sendAll("~~Server~~: Script update failed. Business as usual!", main);
                        
                        //  Tell updater and auth what went wrong
                        sys.sendMessage(source, err, chan);
                        sys.sendAll(err, watch);
                        
                        //  Tell the server what went wrong.
                        print(err);
                    }
                };
                
                //  Warn everyone about the coming lag
                //  sys.sendAll("~~Server~~: Script update in progress. We apologise for any lag.", main);
                
                //  grab the script
                sys.webCall(updateURL, changeScript);
                return true;
            }
        },
        
        "update" : {
            run : function (source, chan, command, commandData, mcmd) {

                //  If you aren't owner, gtfo
                if (db.auth(source) < 3) {
                    return false;
                }
                
                //  Data must exist
                if (commandData == undefined || commandData.length < 3) {
                    return false;
                }
                
                
                //  grab the file
                sys.webCall(root + commandData, function (resp) {
                
                    //  If nothing was received, do nothing.
                    if (resp == "") {
                        return false;
                    }
                    
                    //  Attempt to update.
                    try {
                    
                        //  Write the file
                        sys.writeToFile(commandData, resp);
                        
                        sys.sendMessage(source, "Success!", chan);
                        
                    }
                    
                    //  Failed!
                    catch (err) {
                                                
                        //  Tell updater and auth what went wrong
                        sys.sendMessage(source, err, chan);
                        sys.sendAll(err, watch);
                        
                        //  Tell the server what went wrong.
                        print(err);
                    }
                });
                return true;
            }
            
        },

        //  Updates the tiers. Runs in much the same way as updatescript.
        "updatetiers" : {
            run : function (source, chan, command, commandData, mcmd) {
            
                if (2 < db.auth(source) || sys.name(source) == Config.TierOwner) {
                    var updateURL = Config.TiersURL;
                    if (commandData != undefined && commandData.length > 10) {
                        updateURL = commandData;
                    }
                    var changeTiers = function (resp) {
                        if (resp === "") {
                            return false;
                        }
                        try {
                            sys.writeToFile('tiers.xml', resp);
                            sys.reloadTiers();
                        } catch (err) {
                            sys.sendAll('Updating failed, loaded old scripts!', watch);
                            sys.sendMessage(source, err, chan);
                            print(err);
                        }
                    };
                    sys.webCall(updateURL, changeTiers);
                    return true;
                }
                return false;
            }
        },
        
        "homura" : {
            run : function (source, chan, command, commandData, mcmd) {
                if (db.auth(source) == 4) {
                    sys.sendHtmlAll(db.playerToString(source, true, chan == rpchan) + Pictures["homura"] + (commandData == undefined ? "" : commandData), chan);
                    return true;
                }
                return false;
            }
        },
        
        "magi" : {
            run : function (source, chan, command, commandData, mcmd) {
                if (db.auth(source) == 4) {
                    sys.sendHtmlAll(db.playerToString(source, true, chan == rpchan) + Pictures["magi"] + (commandData == undefined ? "" : commandData), chan);
                    return true;
                }
                return false;
            }
        },

        //  Grab the preset URL for the tiers (preferably pastebin)
        "gettiers" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                CommandBot.sendMessage(source, "<a href='" + Config.TiersURL + "'>" + Config.TiersURL + "</a>", chan);
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Grab the preset URL for the script
        "getscript" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                CommandBot.sendMessage(source, "<a href='" + Config.ScriptURL + "'>" + Config.ScriptURL + "</a>", chan);
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Gets all commands. Does no formatting. Very unreadable. Use list handlers or macros to format it nicely.
        "getallcommands" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                sys.sendMessage(source, Object.keys(sys), chan);
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Get the ID of a Pokemon. This is especially useful for alternate form IDs.
        "pokecheck" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                //  If the ID exists
                if (-1 < sys.pokeNum(commandData)) {
                
                    //  then give the ID
                    sys.sendMessage(source, commandData + "'s ID number is: " + sys.pokeNum(commandData), chan);
                }
                else {
                    sys.sendMessage(source, commandData + " does not have an ID number.", chan);
                }
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Get the ID of an item. For some reason, BrightPowder doesn't work
        "itemcheck" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                if (-1 < sys.itemNum(commandData)) {
                    sys.sendMessage(source, commandData + "'s ID number is: " + sys.itemNum(commandData), chan);
                }
                else {
                    sys.sendMessage(source, commandData + " does not have an ID number.", chan);
                }
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Get the ID of a move. Struggle appears twice (lol)
        "movecheck" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                if (-1 < sys.moveNum(commandData)) {
                    sys.sendMessage(source, commandData + "'s ID number is: " + sys.moveNum(commandData), chan);
                }
                else {
                    sys.sendMessage(source, commandData + " does not have an ID number.", chan);
                }
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Get the ID of an Ability. Cacophony is defined :P
        "abilitycheck" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                if (-1 < sys.abilityNum(commandData)) {
                    sys.sendMessage(source, commandData + "'s ID number is: " + sys.abilityNum(commandData), chan);
                }
                else {
                    sys.sendMessage(source, commandData + " does not have an ID number.", chan);
                }
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Steal a player's trainer info
        "info" : {
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Cancel if the player isn't online
                if (target == undefined) {
                    return false;
                }
                
                sys.sendHtmlMessage(source, "<hr>", chan);
                //  Display it otherwise
                sys.sendMessage(source, sys.info(target), chan);
                
                
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Unregisters a user. Use wisely. Only hidden command with responsive feedback.
        "clearpass" : {
            run : function (source, chan, command, commandData, mcmd) {
                //  If you don't have the power, fuck you.
                if (db.auth(source) < 1) {
                    return false;
                }
                
                //  If no one has ever logged in with that name, it can't be registered
                if (sys.dbIp(commandData) == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                
                //  If the name has no password, password can't be cleared.
                if (!sys.dbRegistered(commandData)) {
                    CommandBot.sendMessage(source, "This person isn't registered.");
                    return false;
                }
                
                //  Can't touch owners under any conditions.
                if (2 < sys.dbAuth(commandData)) {
                    CommandBot.sendMessage(source, "Only the server can modify Owner auth.", chan);
                    return false;
                }
                
                //  Take auth from unregistered users.
                if (0 < sys.dbAuth(commandData)) {
                
                    //  Take it away in the DB.
                    sys.changeDbAuth(commandData, 0);
                    
                    //  Take it away in the session.
                    sys.changeAuth(target, 0);
                    
                    //  Tell everyone
                    sys.sendHtmlAll("<font color=blue><timestamp/><b><font size=3>" + commandData + " was usered.</font>");
                }
                
                //  Clear the password
                sys.clearPass(commandData)
                
                //  Tell it worked
                sys.sendMessage(source, "The password has been cleared!", chan);

                logs.log(sys.name(source), command, sys.name(target), "clearing password");
                return true;
            }
        }
    };

    //  These commands will post pictures in-line
    MemeCommands = {
        cost : 40,

        trainers : JSON.parse(db.getFileContent("trainers.json")),
        
        run : function (source, chan, isshiny, command, commandData, mcmd) {
        
            //  The picture for the command
            var i = Pictures[command], pic;

            if (i == undefined) {
                i = this.trainers[command.toLowerCase()];
                if (i != undefined) {
                    i = "<img src='trainer:" + i + "'>";
                }
            }
            
            //  If there is no picture of that name...
            if (i == undefined) {
                //  effective name to be using
                var name = command;
                
                //  see if they wanna post a mega
                if (command == "mega" && 0 < commandData.length) {
                    
                    //  detect the pokemon's name by splitting the commanddata into parts
                    var arr = commandData.split(" ");
                    
                    //  mega name might have X or Y in it
                    if (arr[1] == 'X' || arr[1] == 'x' || arr[1] == 'Y' || arr[1] == 'y') {
                        
                        //  new effective name
                        var effname = command + " " + arr[0] + " " + arr[1];
                        if (sys.pokeNum(effname) != undefined) {
                            
                            //  use this name because it is a match
                            name = effname;
                            
                            //  Remove that name from the commandData so it isn't added to the end
                            commandData = commandData.substring(name.length - 5);
                        }
                    }
                    
                    //  If we found the name, great!
                    else if (sys.pokeNum(arr[0]) != undefined) {
                        
                        //  change the effective name
                        name = command + " " + arr[0];
                        
                        //  Remove that name from the commandData so it isn't added to the end
                        commandData = commandData.substring(name.length - 5);
                    }
                }
                
                //  Try to use a Pokemon instead
                var num = sys.pokeNum(name);
                
                //  Make sure it is a Pokemon though
                if (num == undefined) {
                    return false;
                }
                
                //  Display the message
                pic = "<img src='pokemon:num=" + num + "&shiny=" + (isshiny?"true":"false") + "&gender=female&back=false&gen=6'/>";
            }
            
            //  There is a picture so use that
            else {
                pic = i;
            }
            
            if (!hash.get("cmd_meme")) {
                CommandBot.sendMessage(source, "Posting pictures to chat is currently disabled.", chan);
                return true;
            }

            //  Make the display
            sys.sendHtmlAll(db.playerToString(source, true, chan == rpchan) + " " + pic + " " + db.htmlEscape(commandData), chan);
            return true;
        },
        
        //  The list of publically known images. There are obviously more as any picture on the server can be presented
        list : [
            ":P - an MSN smiley",
            "aliens - We can't explain the phenomenon. Therefore, aliens.",
            "braceyourself - Winter's coming.",
            "disapprove - My father, I am disappoint",
            "doge - such doge very meme wow",
            "facepalm - Dawn facepalms",
            "fail - when one facepalm isn't enough",
            "fry - Fry in doubt",
            "fucking - There are 8 badges in Kanto. He collected all 10.",
            "giggity - For the Quagmire in all of us.",
            "gotcha - Challenge Accepted",
            "interesting - Stay thirsty, my friends.",
            "morpheus - Morpheus blows your fucking mind",
            "oak - He knows all",
            "onions - Will you get out of here!?",
            "otaku - daisuki desu!",
            "peekaboo - I saw that",
            "philosophy - A very curious Philosoraptor",
            "success - oh, baby!",
            "uhh - Patrick confused",
            "wish - a felinesk devil spawn",
            "wonka - Condescending Cocoa maker",
            "wumbology - the study of wumbo",
            "zoidberg - why not?"
        ]
    };

    //  These commands can be accessed by all users.
    UserCommands = {
        //  Shows all commands, their costs, and their descriptions.
        "commands" : {
            cost : 0,
            help : "View all user commands",
            run : function (source, chan, command, commandData, mcmd) {
                //  Prepare the display
                sys.sendHtmlMessage(source, "<hr>", chan);
                
                CommandBot.sendMessage(source, "User Commands List:", chan);
                var showMessage="<br><table><tr><td width=10%></td><td width=15%></td><td></td></tr>";
                
                //  Add all the commands
                for (var c in UserCommands) {
                    showMessage+="<tr><td>" + UserCommands[c].cost + "pp</td><td><b>!" + c + "</b></td><td>" + UserCommands[c].help + "</td></tr>";
                }
                
                //  Complete the display
                showMessage+="</table><br>";
                
                //  Display
                sys.sendHtmlMessage(source, showMessage, chan);
                
                
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Shows detailed info on a certain command.
        "help" : {
            cost : 0,
            param : ["command"]
            ,
            help : "Provides detailed explanation of any command.",
            run : function (source, chan, command, commandData, mcmd) {
                //  Default command to help.
                if (commandData == undefined) {
                    commandData = "help";
                }
                
                //  lowercase the command
                var c = commandData.toLowerCase(), list;
                
                //  If it doesn't exist, say so.
                if (UserCommands[c] == undefined) {
                    CommandBot.sendMessage(source, "Either '!" + c + "' is not a user command or you don't have the power to use it. (Did you mean !rphelp?)", chan);
                    return false;
                }
                
                //  Display the info
                sys.sendHtmlMessage(source, "<hr>", chan);
                
                CommandBot.sendMessage(source, "Information about " + c + ":", chan);
                sys.sendMessage(source, UserCommands[c].help, chan);
                sys.sendMessage(source, "", chan);
                
                
                CommandBot.sendMessage(source, "Usage:", chan);
                
                //  If there are no parameters, just put it.
                if (UserCommands[c].param == undefined) {
                    sys.sendMessage(source, "!" + c, chan);
                    
                } else {    //  If there are parameters, demonstrate them.
                    sys.sendMessage(source, "!" + c + " " + UserCommands[c].param.join(":"), chan);
                }
                
                //  Finish formatting
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  View all the auth of the server
        "auth" : {
            cost : 0,
            help : "View who all has server authority",
            run : function (source, chan, command, commandData, mcmd) {

                sys.sendHtmlMessage(source, "<hr>", chan);
                CommandBot.sendMessage(source, "The server authority members are:", chan);
                sys.sendMessage(source, "", chan);
                //  Grab the list of auth
                var authlist = sys.dbAuths().sort()
                
                //  Format the display
                sys.sendHtmlMessage(source, "<font color=purple><timestamp/> <b>Owners</b>", chan);
                
                //  Check for each owner
                for (x in authlist) {
                    if (sys.dbAuth(authlist[x]) == 3) {
                    
                        //  See if the player is online
                        var isOn = (sys.id(authlist[x]) != undefined);
                        
                        //  display message
                        sys.sendHtmlMessage(source, "<img src=themes/classic/client/o" + ((isOn) ? "Available" : "Away") + ".png/> " + ((isOn) ? sys.name(sys.id(authlist[x])) : authlist[x]) + " is <font color='" + ((isOn) ? "green'>Online" : "red'>offline") + "</font>", chan);
                    }
                }
                
                sys.sendMessage(source, "", chan);
                
                sys.sendHtmlMessage(source, "<font color=red><timestamp/> <b>Admins</b>", chan);
                //  Prepare for admin display
                
                //  Admin display
                for (x in authlist) {
                    if (sys.dbAuth(authlist[x]) == 2) {
                        var isOn = (sys.id(authlist[x]) != undefined);
                        
                        sys.sendHtmlMessage(source, "<img src=themes/classic/client/a" + ((isOn) ? "Available" : "Away") + ".png/> " + ((isOn) ? sys.name(sys.id(authlist[x])) : authlist[x]) + " is <font color='" + ((isOn) ? "green'>Online" : "red'>offline") + "</font>", chan);
                    }
                }
                
                sys.sendMessage(source, "", chan);
                
                sys.sendHtmlMessage(source, "<font color=blue><timestamp/> <b>Moderators</b>", chan);
                
                // Moderator display
                for (x in authlist) {
                    if (sys.dbAuth(authlist[x]) == 1) {
                        var isOn = (sys.id(authlist[x]) != undefined);
                        
                        sys.sendHtmlMessage(source, "<img src=themes/classic/client/m" + ((isOn) ? "Available" : "Away") + ".png/> " + ((isOn) ? sys.name(sys.id(authlist[x])) : authlist[x]) + " is <font color='" + ((isOn) ? "green'>Online" : "red'>offline") + "</font>", chan);
                    }
                }
                
                sys.sendMessage(source, "", chan);
                
                sys.sendHtmlMessage(source, "<font color=green><timestamp/> <b>Mega Users</b>", chan);
                
                // Megauser display
                list = hash.get("megauser");
                for (x in list) {
                    var isOn = (sys.id(list[x]) != undefined);
                    
                    sys.sendHtmlMessage(source, "<img src=themes/classic/client/u" + ((isOn) ? "Available" : "Away") + ".png/> " + ((isOn) ? sys.name(sys.id(list[x])) : list[x]) + " is <font color='" + ((isOn) ? "green'>Online" : "red'>offline") + "</font>", chan);
                }
                
                sys.sendMessage(source, "", chan);
                sys.sendHtmlMessage(source, "<font color=#FF0CC><timestamp/> <b>Party Hosts</b>", chan);
                
                // Megauser display
                list = hash.get("partyhost");
                for (x in list) {
                    var isOn = (sys.id(list[x]) != undefined);
                    
                    sys.sendHtmlMessage(source, "<img src=themes/classic/client/u" + ((isOn) ? "Available" : "Away") + ".png/> " + ((isOn) ? sys.name(sys.id(list[x])) : list[x]) + " is <font color='" + ((isOn) ? "green'>Online" : "red'>offline") + "</font>", chan);
                }
                
                
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Shows a player's aliases
        "alts" : {
            cost : 0,
            help : "View all of your aliases/alts",
            run : function (source, chan, command, commandData, mcmd) {
                //  Just use built-in function
                
                sys.sendHtmlMessage(source, "<hr>", chan);
                CommandBot.sendMessage(source, "Your aliases are: " + sys.aliases(sys.ip(source)), chan);
                
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },

        //  Pick between choices
        "pick" : {
            cost : 30,
            help : "Make a decision",
            run : function (source, chan, command, commandData, mcmd) {
            
                //  If the list isn't provided, refuse
                if (commandData == undefined || mcmd.length < 2) {
                    CommandBot.sendMessage(source, "List is not long enough.", chan);
                    return false;
                }
                
                var list = [];
                
                //  For every item
                for (var i = 0; i < mcmd.length; i++) {
                    //  only keep uniques
                    if (-1 == list.indexOf(mcmd[i])) {
                        list.push(mcmd[i]);
                    }
                }
                
                //  If there aren't at least 2 options after duplication
                if (list.length < 2) {
                
                    //  then they had too many dupes
                    CommandBot.sendMessage(source, "List is not long enough.", chan);
                    return false;
                }
                
                //  Display the pick message (also shows with dupes removed)
                db.sendHtmlAll(source, db.playerToString(source, true, (rpchan == chan)) + " !pick " + list.join(":"), chan);
                
                //  Show the result
                db.sendBotAll("I pick " + list[sys.rand(0, list.length)] + "!", chan, "Magic Sea Conch", "#00BBBB");
                return true;
            }
        },

        //  Displays the rules to the user. Android users get a different format so they can read it too.
        "rules" : {
            cost : 0,
            help : "View the rules",
            run : function (source, chan, command, commandData, mcmd) {
            
                //  If the user is on an android
                if (sys.os(source) == "Android") {
                    
                    //  then print the messages with no formatting
                    for (var i = 0; i < Config.Rules.length; i++) {
                        sys.sendMessage(source, (i + 1) + ": " + Config.Rules[i], chan);
                    }
                    return true;
                } else {
                
                    //  Begin the table formatting
                    var showMessage="<br><center><font color='red' size=+4>Da Rules</font></center><br><table width=100% style='background-color:qlineargradient(x1:0,y1:0,x2:0,y2:1,stop:0 white,stop:0.1 red,stop:0.25 black,stop:0.75 black,stop:0.9 red,stop:1 white); color:white'><tr><td width= 5%></td><td></td></tr><tr><td></td><td></td></tr>";
                    
                    //  Add the formatted rules to the table
                    for (var x = 0; x < Config.Rules.length; x++) {
                        showMessage+="<tr><td><b><center>"+(x+1)+":</center></b></td><td>"+Config.Rules[x]+"</td></tr>";
                    }
                    
                    //  Finish the table formatting
                    showMessage+="<tr><td></td><td></td></tr><tr><td></td><td></td></tr></table>";
                    
                    //  Send message
                    sys.sendHtmlMessage(source, showMessage);
                    return true;
                }
            }
        },



        //  Two commands in one; will show the rules if asked for and the current league otherwise
        "league" : {
            cost : 0,
            help : "View the league. To view the league rules, use !league rules",
            run : function (source, chan, command, commandData, mcmd) {
            
                //  If they wanna know the rules
                if (commandData == "rules") {
                    //  Format the output
                    sys.sendMessage(source, "", chan);
                    sys.sendMessage(source, "** League Rules**", chan);
                    sys.sendMessage(source, "", chan);
                    
                    //  Show the rules one by one
                    for (var i = 0; i < Config.LeagueRules.length; i++) {
                        sys.sendMessage(source, (i + 1) + ": " + Config.LeagueRules[i], chan);
                    }
                    
                    //  We're done
                    return true;
                }
                
                //  They don't wanna know the rules
                sys.sendMessage(source, "", chan);
                sys.sendMessage(source, "** The League **", chan);
                sys.sendMessage(source, "", chan);
                
                //  Show the league members one by one
                for (var x = 0; x < Config.League.length; x++) {
                
                    //  Only if there is a league
                    if (Config.League[x].length > 0) {
                        sys.sendMessage(source, Config.League[x][0] + " - " + Config.League[x][1] + " " + (sys.id(Config.League[x][0]) !== undefined ? "(online):" : "(offline)"), chan);
                    }
                }
                
                //  Add some spacing
                sys.sendMessage(source, "", chan);
                
                //  Show who all is in the Hall of Fame
                if (Config.HallOfFame.length > 0) {
                
                    //  Format output
                    sys.sendMessage(source, "", chan);
                    sys.sendMessage(source, "** HALL OF FAME **", chan);
                    sys.sendMessage(source, "", chan);
                    
                    //  Print list one by one
                    for (var i = 0; i < Config.HallOfFame.length; i++) {
                        sys.sendMessage(source, Config.HallOfFame[i], chan);
                    }
                }
                
                //  Add spacing
                sys.sendMessage(source, "", chan);
                return true;
            }
        },

        //  Displays a lot of information about a specified Pokemon
        "pokemon" : {
            cost : 0,
            help : "Check information about a Pokemon (for example, /pokemon Mega Lucario to see the stats of a Mega form)",
            run : function (source, chan, command, commandData, mcmd) {
                //  Make sure there is input
                if (!commandData) {
                    CommandBot.sendMessage(source, "Please specify a Pokémon!", chan);
                    return false;
                }
                //  Start with the ID
                var pokeId;
                
                //  If the data is a name, get a number
                if (isNaN(commandData)) {
                    pokeId = sys.pokeNum(commandData);
                } else {    //  Otherwise make sure the number is valid
                    if (commandData < 1 || commandData > 718) {
                        CommandBot.sendMessage(source, commandData + " is not a valid Pokédex number!", chan);
                        return false;
                    } 
                    
                    //  Keep the valid ID
                    pokeId = commandData;
                }
                
                //  If the ID is 0 or undefined after both tests, it's not a Pokemon
                if (!pokeId) {
                    CommandBot.sendMessage(source, commandData + " is not a valid Pokémon!", chan);
                    return false;
                }
                
                //  Grab the stuff that there are sys functions for
                var type1 = sys.type(sys.pokeType1(pokeId));
                var type2 = sys.type(sys.pokeType2(pokeId));
                var ability1 = sys.ability(sys.pokeAbility(pokeId, 0));
                var ability2 = sys.ability(sys.pokeAbility(pokeId, 1));
                var ability3 = sys.ability(sys.pokeAbility(pokeId, 2));
                var baseStats = sys.pokeBaseStats(pokeId);
                
                //  Prepare lists for mapping
                var stats = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"],
                    levels = [5, 50, 100];
                    
                //  Begin output
                sys.sendHtmlMessage(source, "", chan);
                sys.sendHtmlMessage(source, "<b><font size = 4># " + pokeId % 65536 + " " + sys.pokemon(pokeId) + "</font></b>", chan);
                
                //  Grab the sprites
                sys.sendHtmlMessage(source, "<img src='pokemon:num=" + pokeId + "&gen=6'><img src='pokemon:num=" + pokeId + "&shiny=true&gen=6'>", chan);
                
                //  Show some basic stats
                sys.sendHtmlMessage(source, "<b>Type:</b> " + type1 + (type2 === "???" ? "" : "/" + type2), chan);
                sys.sendHtmlMessage(source, "<b>Abilities:</b> " + ability1 + (sys.pokemon(pokeId).substr(0, 5) === "Mega " ? "" : (ability2 === "(No Ability)" ? "" : ", " + ability2) + (ability3 === "(No Ability)" ? "" : ", " + ability3 + " (Hidden Ability)")), chan);
                
                //  These ones require external functions to access the db since there isn't a sys function for this
                sys.sendHtmlMessage(source, "<b>Height:</b> " + db.getHeight(pokeId) + " m", chan);
                sys.sendHtmlMessage(source, "<b>Weight:</b> " + db.getWeight(pokeId) + " kg", chan);
                sys.sendHtmlMessage(source, "<b>Base Power of Low Kick/Grass Knot:</b> " + db.weightPower(db.getWeight(pokeId)), chan);
                
                //  Make the stats table
                var table = "<table border = 1 cellpadding = 3>";
                table += "<tr><th rowspan = 2 valign = middle><font size = 5>Stats</font></th><th rowspan = 2 valign = middle>Base</th><th colspan = 3>Level 5</th><th colspan = 3>Level 50</th><th colspan = 3>Level 100</th></tr>";
                table += "<tr><th>Min</th><th>Max</th><th>Max+</th><th>Min</th><th>Max</th><th>Max+</th><th>Min</th><th>Max</th><th>Max+</th>";
                
                //  For each stat...
                for (var x = 0; x < stats.length; x++) {
                    
                    //  Grab the base stat value
                    var baseStat = baseStats[x];
                    
                    //  Format the table for output
                    table += "<tr><td valign = middle><b>" + stats[x] + "</b></td><td><center><font size = 4>" + baseStat + "</font></center></td>";
                    
                    //  For the levels list provided...
                    for (var i = 0; i < levels.length; i++) {
                    
                        //  Show the stat calculation. HP requires a different calculation
                        if (x === 0) {
                            table += "<td valign = middle><center>" + db.calcHP(baseStat, 31, 0, levels[i]) + "</center></td><td valign = middle><center>" + db.calcHP(baseStat, 31, 252, levels[i]) + "</center></td><td valign = middle><center>-</center></td>";
                        } else {    
                            
                            //  The other stats use this formula instead
                            table += "<td valign = middle><center>" + db.calcStat(baseStat, 31, 0, levels[i], 1) + "</center></td><td valign = middle><center>" + db.calcStat(baseStat, 31, 252, levels[i], 1) + "</center></td><td valign = middle><center>" + db.calcStat(baseStat, 31, 252, levels[i], 1.1) + "</center></td>";
                        }
                    }
                    
                    //  End this row
                    table += "</tr>";
                }
                
                //  Finish output and print
                table += "</table>";
                sys.sendHtmlMessage(source, table, chan);
                return true;
            }
        },
        
        "types" : {
            cost : 0,
            help : "Check information about type effectiveness",
            run : function (source, chan, command, commandData, mcmd) {
                var msg = "<table style='text-align:center'><tr><th></th><th></th><th colspan='18'>Target Type</th></tr>";
                msg += "<tr><td></td><td></td>";
                for (var i = 0; i < 18; i++) {
                    msg += "<td><img src='Themes/Classic/types/type" + i + ".png'/></td>";
                }
                msg += "</tr>";
                for (var i = 0; i < 18; i++)
                {
                    if (i == 0)
                    {
                        msg += "<tr><td rowspan='18'>Attack</td>";
                    }
                    else
                    {
                        msg += "<tr>";
                    }
                    msg += "<td><img src='Themes/Classic/types/type" + i + ".png'/></td>";
                    for (var j = 0; j < 18; j++)
                    {
                        var eff = db.data.typeeff[i][j];
                        msg += "<td style='text-align:center;background-color: " + (eff == 0 ? 'black' : (eff == 1 ? 'red' : (eff == 2 ? 'white' : 'green'))) + "'>" + (eff/2) + "x</td>";
                    }
                }
                    msg += "</tr><tr><td colspan='20'></tr>";
                
                sys.sendHtmlMessage(source, msg, chan);
                
                return true;
            }
            
        },
        
        "invertedtypes" : {
            cost : 0,
            help : "Check information about inverted type effectiveness",
            run : function (source, chan, command, commandData, mcmd) {
                var msg = "<table style='text-align:center'><tr><th></th><th></th><th colspan='18'>Target Type</th></tr>";
                msg += "<tr><td></td><td></td>";
                for (var i = 0; i < 18; i++) {
                    msg += "<td><img src='Themes/Classic/types/type" + i + ".png'/></td>";
                }
                msg += "</tr>";
                for (var i = 0; i < 18; i++)
                {
                    if (i == 0)
                    {
                        msg += "<tr><td rowspan='18'>Attack</td>";
                    }
                    else
                    {
                        msg += "<tr>";
                    }
                    msg += "<td><img src='Themes/Classic/types/type" + i + ".png'/></td>";
                    for (var j = 0; j < 18; j++)
                    {
                        var eff = db.data.typeeff[i][j];
                        msg += "<td style='text-align:center;background-color: " + (eff == 4 ? "red'>.5" : (eff == 2 ? "white'>1" : "green'>2")) + "x</td>";
                    }
                }
                    msg += "</tr><tr><td colspan='20'></tr>";
                
                sys.sendHtmlMessage(source, msg, chan);
                
                return true;
            }
            
        },
        
        //  same for pokemon only for moves
        "move" :  {
            cost : 0,
            help : "Check information about a move",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Can't specify an inexistent move.
                if (!commandData) {
                    CommandBot.sendMessage(source, "Please specify a move!", chan);
                    return false;
                }
                
                //  try to get the id by number
                var moveId = commandData;
                
                //  If it's not a number
                if (isNaN(moveId)) {
                    
                    //  match the name to the number
                    moveId = sys.moveNum(commandData);
                }
                
                //  Break if no move matches this number
                if (!moveId) {
                    CommandBot.sendMessage(source, commandData + " is not a valid move!", chan);
                    return false;
                }
                
                //  Use the sys and db commands to gather the info
                var type = sys.type(sys.moveType(moveId)),
                    category = db.getMoveCategory(moveId),
                    BP = db.getMoveBP(moveId),
                    accuracy = db.getMoveAccuracy(moveId),
                    PP = db.getMovePP(moveId),
                    contact = (db.getMoveContact(moveId) ? "Yes" : "No"),
                    effect = db.getMoveEffect(moveId);
                
                //  Print out the data
                sys.sendHtmlMessage(source, "", chan);
                sys.sendHtmlMessage(source, "<b><font size = 4>" + sys.move(moveId) + "</font></b>", chan);
                sys.sendHtmlMessage(source, "<table border = 1 cellpadding = 2><tr><th>Type</th><th>Category</th><th>Power</th><th>Accuracy</th><th>PP (Max)</th><th>Contact</th></tr><tr><td><center>" + type + "</center></td><td><center>" + category + "</center></td><td><center>" + BP + "</center></td><td><center>" + accuracy + "</center></td><td><center>" + PP + " (" + (PP * 8/5) + ")</center></td><td><center>" + contact + "</center></td></tr></table>");
                sys.sendHtmlMessage(source, "", chan);
                sys.sendHtmlMessage(source, "<b>Effect:</b> " + effect, chan);
                sys.sendHtmlMessage(source, "", chan);
                return true;
            }
        },
        
        //  Same as move only for abilities
        "ability" : {
            cost : 0,
            help : "Check information about an ability",
            run : function (source, chan, command, commandData, mcmd) {
                if (commandData === "") {
                    CommandBot.sendMessage(source, "Please specify an ability!", chan);
                    return false;
                }
                var abilityId = sys.abilityNum(commandData);
                if (!abilityId) {
                    CommandBot.sendMessage(source, commandData + " is not a valid ability!", chan);
                    return false;
                }
                sys.sendHtmlMessage(source, "", chan);
                sys.sendHtmlMessage(source, "<b><font size = 4>" + sys.ability(abilityId) + "</font></b>", chan);
                sys.sendHtmlMessage(source, "<b>Effect:</b> " + db.getAbility(abilityId), chan);
                sys.sendHtmlMessage(source, "", chan);
                return true;
            }
        },
        
        //  same as ability only for items
        "item" : {
            cost : 0,
            help : "Check information about an item",
            run : function (source, chan, command, commandData, mcmd) {
                if (commandData === "") {
                    CommandBot.sendMessage(source, "Please specify an item!", chan);
                    return false;
                }
                var itemId = sys.itemNum(commandData);
                var berryId = itemId - 8000;
                if (!itemId) {
                    CommandBot.sendMessage(source, commandData + " is not a valid item!", chan);
                    return false;
                }
                var isBerry = (commandData.toLowerCase().substr(commandData.length - 5) === "berry");
                var flingPower = isBerry ? "10" : db.getFlingPower(itemId);
                var isGSC = false;
                if (itemId >= 9000 || itemId === 1000 || itemId === 1001 || itemId === 304) {
                    isGSC = true;
                }
                sys.sendHtmlMessage(source, "", chan);
                sys.sendHtmlMessage(source, "<b><font size = 4>" + sys.item(itemId) + "</font></b>", chan);
                if (!isGSC) {
                    sys.sendHtmlMessage(source, "<img src=item:" + itemId + ">", chan);
                }
                sys.sendHtmlMessage(source, "<b>Effect:</b> " + (isBerry ? db.getBerry(berryId) : db.getItem(itemId)), chan);
                if (!isGSC) {
                    if (flingPower !== undefined) {
                        sys.sendHtmlMessage(source, "<b>Fling base power:</b> " + db.flingPower, chan);
                    }
                    if (isBerry) {
                        sys.sendHtmlMessage(source, "<b>Natural Gift type:</b> " + db.getBerryType(berryId), chan);
                        sys.sendHtmlMessage(source, "<b>Natural Gift base power:</b> " + db.getBerryPower(berryId), chan);
                    }
                }
                sys.sendHtmlMessage(source, "", chan);
                return true;
            }
        },
        
        //  Displays 
        "nature" : {
            cost : 0,
            help : "Use /nature chart to see the whole chart, or /nature name to view details on a certain one.",
            run : function (source, chan, command, commandData, mcmd) {
                var fullStatName = {
                    "Atk" : "Attack",
                    "Def" : "Defense", 
                    "Spd" : "Speed", 
                    "SAtk" : "Special Attack",
                    "SDef" : "Special Defense"
                };
                if (commandData && commandData != "chart") {
                    var natureId = sys.natureNum(commandData);
                    if (!natureId && commandData.toLowerCase() != "hardy") {
                        CommandBot.sendMessage(source, commandData + " is not a valid nature!", chan);
                        return false;
                    }
                    var nature = sys.nature(natureId);
                    
                    var raised = fullStatName[db.statBoostedBy(nature)];
                    var lowered = fullStatName[db.statReducedBy(nature)];
                    sys.sendHtmlMessage(source, "<b><font size=4>" + nature + "</font></b>", chan);
                    sys.sendHtmlMessage(source, "<b>Increases</b> the " + raised + " stat by 10%.", chan);
                    sys.sendHtmlMessage(source, "<b>Decreases</b> the " + lowered + " stat by 10%.", chan);
                    return true;
                }
                CommandBot.sendMessage(source, "Please specify a nature.", chan);
                return false;
            }
        },
        
        //  View the natures in a nice table
        "natures" : {
            cost: 0, help: "View a chart on which stats are affected by natures",
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<br><b><font size=4>Natures Guide</font></b>", chan);
                sys.sendHtmlMessage(source, "<style type='text/css'>td{border: 1px black solid; padding: 2px; text-align: center}td.left{padding-right:3px}</style><table style='text-align: center'><tr><td class='left'></td><td><b>+ Attack</b></td><td><b>+ Defense</b></td><td><b>+ Speed</b></td><td><b>+ Sp Attack</b></td><td><b>+ Sp Defense</b></td></tr><tr><td class='left'><b>- Attack</b></td><td>Hardy</td><td>Bold</td><td>Timid</td><td>Modest</td><td>Calm</td></tr><tr><td class='left'><b>- Defense</b></td><td>Lonely</td><td>Docile</td><td>Hasty</td><td>Mild</td><td>Gentle</td></tr><tr><td class='left'><b>- Speed</b></td><td>Brave</td><td>Relaxed</td><td>Serious</td><td>Quiet</td><td>Sassy</td></tr><tr><td class='left'><b>- Sp Attack</b></td><td>Adamant</td><td>Impish</td><td>Jolly</td><td>Bashful</td><td>Careful</td></tr><tr><td class='left'><b>- Sp Defense</b></td><td>Naughty</td><td>Lax</td><td>Naive</td><td>Rash</td><td>Quirky</td></tr></table>", chan);
                return true;
            }
        },

        //  If a hidden ability is obtainable
        "isreleased" : {
            cost : 0,
            help : "Check if a Pokemon's hidden ability is released.",
            run : function (source, chan, command, commandData, mcmd) {
                //  Only existing pokemon can be released
                var p = sys.pokeNum(commandData);
                if (p == undefined)
                {
                    CommandBot.sendMessage(source, "That Pokemon does not exist.", chan);
                    return false;
                }
                TierBot.sendMessage(source, sys.pokemon(p) + "'s hidden ability is " + (-1 < hash.get("unreleasedPokes").indexOf(sys.pokemon(sys.pokeNum(commandData))) ? "not " : " ") + "released.", chan);
                return true;
            }
        },
        
        //  Show the whole list
        "unreleasedabilities" : {
            cost : 0, help : "See all Pokemon with unreleased abilities",
            run : function (source, chan, command, commandData, mcmd) {
                TierBot.sendMessage(source, hash.get("unreleasedPokes").join(", "), chan);
                return true;
            }
        },

        //  Show all the members
        "allmembers" : {
            cost : 0,
            help : "View all members of the clan",
            run : function (source, chan, command, commandData, mcmd) {
                clan.showAll(source, chan);
                return true;
            }
        },

        //  View info on jug
        "juggernaut" : {
            cost : 0,
            help : "View the current Juggernaut",
            param : ["rules (optional)"],
            run : function (source, chan, command, commandData, mcmd) {
                //  If they want the rules they can just look.
                if (commandData == "rules") {
                    CommandBot.sendMessage(source, "Juggernaut Rules", chan);
                    sys.sendMessage(source, "1: The rules of the battle do not matter; no tiers, no excuse, no redoes. Forfeiting counts as losing, while ties result in no change. You solely are responsible for what you accept.", chan);
                    sys.sendMessage(source, "2: If you are the Juggernaut and you win a battle, you get a point.", chan);
                    sys.sendMessage(source, "3: If you are the Juggernaut and you lose a battle, you lose all of your points and are replaced with the winner.", chan);
                    sys.sendMessage(source, "4: You may only get 1 point per IP range.", chan);
                    sys.sendMessage(source, "5: Your name is on the banner as the current Juggernaut. People will want to change that. Accept their challenges when you can.", chan);
                    sys.sendMessage(source, "6: You must battle at least once per two days. Consistently pushing the limits may cost you the Juggernaut.", chan);
                    sys.sendMessage(source, "7: Don't forget to bring your towel.", chan);
                    return true;
                }
                
                //  Otherwise just view current stats
                CommandBot.sendMessage(source, juggernaut.getName() + " is the current Juggernaut with a score of " + juggernaut.getScore() + ".", chan);
                return true;
            }
        },

        //  View your rank
        "ranking" : {
            cost : 0,
            help : "View your ranking by tier.",
            run : function (source, chan, command, commandData, mcmd) {
                //  Show the message once it's decided
                var announceTier = function(tier) {
                
                    //  Announce it
                    var rank = sys.ranking(sys.name(source), tier);
                    
                    //  Rank exists
                    if (rank === undefined) {
                        TierBot.sendMessage(source, "You are not ranked in " + tier + " yet!", chan);
                    }
                    
                    //  Rank doesn't exist
                    else {
                        TierBot.sendMessage(source, "Your rank in " + tier + " is " + rank + "/" + sys.totalPlayersByTier(tier) + " [" + sys.ladderRating(source, tier) + " points / " + sys.ratedBattles(sys.name(source), tier) +" battles]!", chan);
                    }
                };
                
                //  If they want a specific tier let them
                if (commandData !== undefined)
                {
                    //  Make sure the tier is ranked
                    if (sys.totalPlayersByTier(commandData) === 0) {
                        TierBot.sendMessage(source, commandData + " is not a ranked tier.", chan);
                        return false;
                    }
                    
                    //  give the info
                    else {
                        announceTier (commandData);
                    }
                    return true;
                }
                
                //  otherwise just use all of the teams
                //  List of vals based on team count
                [0,1,2,3,4,5].slice(0, sys.teamCount(source))
                    
                    //  Do this for every team
                    .map(function (i) {
                        return sys.tier(source, i); 
                    })
                    
                    //  Removes the ones that aren't real tiers
                    .filter(function (tier) {
                        return tier !== undefined;
                    })
                    
                    //  Put the tiers in order    
                    .sort()
                    
                    //  Remove the tiers that don't exist
                    .filter(function (tier, index, array){
                        return tier !== array[index-1];
                    })
                    
                    //  Does this for every team
                    .forEach(announceTier);
                return true;
            }
        },

        //  Autoreject
        "idle" : {
            cost : 0,
            help : "Change whether players can challenge you",
            param : ["on/off (optional- sets on if not specified)"],
            run : function (source, chan, command, commandData, mcmd) {
                //  If they wanna unidle
                if (commandData == "off")
                {
                    //  unidle
                    sys.changeAway(source, false);
                    CommandBot.sendMessage(source, "You are no longer idling.", chan);
                    return true;
                }
                
                //  Whether commandData == "on" or there is just nothing do it idle
                //  This fits both VP and PO formats of idle command
                CommandBot.sendMessage(source, "You are now idling.", chan);
                sys.changeAway(source, true);
                return true;
            }
        },

        //  No longer autoreject
        "unidle" : {
            cost : 0,
            help : "Allow players to challenge you",
            run : function (source, chan, command, commandData, mcmd) {
            
                //  An alternate (VP) way to unidle
                sys.changeAway(source, false);
                CommandBot.sendMessage(source, "You are no longer idling.", chan);
                return true;
            }
        },

        //  Check the progress of the tour
        "viewround" : {
            cost : 0,
            help : "View information on the current tournament round",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Make sure there is a tour
                if (tourmode != 2){
                    TourBot.sendMessage(source, "No tournament is running.", chan);
                    return false;
                }
                
                //  Start displays
                sys.sendHtmlMessage(source, "<hr>", chan);
                TourBot.sendMessage(source, "Round " + roundnumber + " of " + tourtier.toUpperCase() + " Tournament", chan);
                
                //  Display finished battles
                if (battlesLost.length > 0) {
                
                    //  Header
                    sys.sendMessage(source, "*** Battles finished ***");
                    sys.sendMessage(source, "", chan);
                    
                    //  Show all who finished
                    for (var i = 0; i < battlesLost.length; i += 2) {
                        sys.sendMessage(source, battlesLost[i] + " won against " + battlesLost[i+1], chan);
                    }
                    sys.sendMessage(source, "", chan);
                }
                
                //  Display in progress stuff
                if (tourbattlers.length > 0) {
                
                    //  Battles that started
                    if (battlesStarted.indexOf(true) != -1) {
                    
                        //  Header
                        sys.sendMessage(source, "", chan);
                        sys.sendMessage(source, "*** Ongoing battles ***", chan);
                        
                        //  Show the pairings
                        for (var i = 0; i < tourbattlers.length; i += 2) {
                            if (battlesStarted [i/2] == true) {
                                sys.sendMessage(source, tourplayers[tourbattlers[i]] + " VS " + tourplayers[tourbattlers[i+1]], chan);
                            }
                        }
                        sys.sendMessage(source, "", chan);
                    }
                    
                    //  Battles that haven't started
                    if (battlesStarted.indexOf(false) != -1) {
                        
                        //  Header
                        sys.sendMessage(source, "", chan);
                        sys.sendMessage(source, "*** Yet to start battles ***", chan);
                        
                        //  Show the pairings
                        for (var i = 0; i < tourbattlers.length; i+=2) {
                            if (battlesStarted [i/2] == false) {
                                sys.sendMessage(source, tourplayers[tourbattlers[i]] + " VS " + tourplayers[tourbattlers[i+1]], chan);
                            }
                        }
                    }
                }
                
                //  Battles that have finished
                if (tourmembers.length > 0) {
                
                    //  Header
                    sys.sendMessage(source, "", chan);
                    sys.sendMessage(source, "*** Members to the next round ***", chan);
                    
                    //  Show who won already
                    var str = "";
                    for (x in tourmembers) {
                        str += (str.length == 0 ? "" : ", ") + tourplayers[tourmembers[x]];
                    }
                    sys.sendMessage(source, str, chan);
                    sys.sendMessage(source, "", chan);
                }
                
                //  Close the message
                sys.sendHtmlMessage(source, "<hr>", chan);
                sys.sendMessage(source, "", chan);
                return true;
            }
        },
    
        //  Run code
        "eval" : {
            cost : 0,
            help : "Run code",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Only superusers can !eval
                if (db.auth(source) == 4) {
                    
                    //  Try to run it
                    try {
                        sys.eval(commandData);
                        
                        //  Don't kick yourself with eval please
                        sys.sendMessage(source, "Success!", chan);
                    }
                    
                    //  Say what went wrong if it broke
                    catch (e) {
                        sys.sendMessage(source, "Failed!", chan);
                        sys.sendMessage(source, e, chan);
                    }
                }
                
                //  Kick anyone else who tries
                else {
                    CommandBot.sendMessage(source, "You gotta do better than that.", chan);
                    sys.kick(source);
                }
                return true;
            }
        },
        
        //  Join a tournament
        "join" : {
            cost : 0,
            help : "Join a tournament",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  There isn't a tournment to join
                if (tourmode != 1) {
                    TourBot.sendMessage(source, "There is no tournament running in the signups phase.", chan);
                    return false;
                }
                
                //  Enforce they have a team in the right tier
                var canjoin = false;
                for (var i = 0; i < sys.teamCount(source); i++) {
                    if (sys.tier(source, i) == tourtier) {
                        canjoin = true;
                        break;
                    }
                }
                
                //  Stop them from joining if no team is in the right tier
                if (!canjoin) {
                    TourBot.sendMessage(source, "You need to have a team in the " + tourtier + " tier in order to join the tournament.", chan);
                    return false;
                }
                
                //  Check for duplicate registration
                var name = sys.name(source).toLowerCase();
                if (tourmembers.indexOf(name.toLowerCase()) != -1) {
                    TourBot.sendMessage(source, "You are already in the tournament.", chan);
                    return false;
                }
                
                //  Make sure there is an opening
                if (tourSpots() > 0) {
                    
                    //  Force unidle
                    sys.changeAway(source,false);
                    
                    //  Add the player
                    tourmembers.push(name);
                    tourplayers[name] = sys.name(source);
                    
                    var spotsleft = tourSpots();
                    
                    //  If no more open spots, start tournament!
                    if (spotsleft == 0) {
                        tourmode = 2;
                        roundnumber = 0;
                        roundPairing();
                    }
                    
                    //  Otherwise show this person has joined
                    else {
                        TourBot.sendAll(sys.name(source) + " joined the tournament! " + spotsleft + " more " + ((spotsleft == 1) ? "spot" : "spots") + " left!", -1);
                    }
                }
                return true;
            }
        },

        "unjoin" : {
            cost : 0,
            help : "Leave a tournament",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Only leave a tournament that is running.
                if (tourmode == 0) {
                    TourBot.sendMessage(source, "You aren't in a tournament.", chan);
                    return false;
                }
                
                //  Unjoin
                var name = sys.name(source).toLowerCase();
                if (tourmembers.indexOf(name) != -1) {
                    
                    //  Remove player from the game
                    tourmembers.splice(tourmembers.indexOf(name),1);
                    delete tourplayers[name];
                    
                    //  Announce leave
                    TourBot.sendAll(sys.name(source) + " left the tournament!", -1);
                    return true;
                }
            
                //  DQ from battles this round
                if (tourbattlers.indexOf(name) != -1) {
                    
                    //  Start the battle
                    battlesStarted[Math.floor(tourbattlers.indexOf(name) / 2)] = true;
                    TourBot.sendAll(sys.name(source) + " left the tournament!", -1);
                    
                    //  End the battle
                    tourBattleEnd(tourOpponent(name), name);
                    return true;
                }
                return false
            }
        },

        "trainers" : {
            cost : 0,
            help : "Check the list of trainers that can be posted in the chat",
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                var str = "<table><tr>", i = 0;
                for (key in MemeCommands.trainers) {
                    if (i % 8 == 0) {
                        str += "</tr><tr>";
                    }
                    str += "<td>" + key + "</td>";
                    i++;
                }
                while (i % 8 != 0) {
                    str += "<td></td>";
                    i++;
                }
                str += "</tr></table>";
                CommandBot.sendMessage(source, "The following labels will display a trainer in chat:<br>" + str, chan);
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },
        
        
        //  Notify someone
        "ping" : {
            cost : 90,
            help : "Catch someone's attention.",
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Only ping if allowed
                if (!hash.get("cmd_ping")) {
                    CommandBot.sendMessage(source,"!ping is disabled right now.", chan);
                    return false;
                }
                
                //  Only ping people who exist
                if (target == undefined) {
                    CommandBot.sendMessage(source, commandData + " isn't logged in.", chan);
                    return false;
                }
                
                //  Ping the person
                sys.sendHtmlMessage(target, "<timestamp/> <font size=+2>You got pinged by " + db.playerToString(source) + "!<ping/></font>");
                CommandBot.sendMessage(source, db.playerToString(target) + " was pinged.", chan);
                return true;
            }
        },
        
        "logs" : {
            cost : 0,
            help : "View the recent auth activity",
            param : ["Number of records"],
            run : function (source, chan, command, commandData, mcmd) {
                logs.display(source, chan, commandData == undefined || isNaN(commandData) ? 25 : commandData);
                return true;
            }
        },

        //  View Tournament rules
        "tourrules" : {
            cost : 0,
            help : "View Tournament rules",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Just display everything
                sys.sendHtmlMessage(source, "<hr>", chan);
                TourBot.sendMessage(source, "Tournament Rules:", chan);
                sys.sendMessage(source, "1: You may only use the tournament's tier in your battles. This is enforced.", chan);
                sys.sendMessage(source, "2: Do not scout other competitors' teams.", chan);
                sys.sendMessage(source, "3: Do not log off after joining. You will be disqualified.", chan);
                sys.sendMessage(source, "4: Do not idle while in a tournament.", chan);
                sys.sendMessage(source, "5: Do not battle players who aren't in the tournament, even (especially) between rounds.", chan);
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },
        
        //  Look at the status of the assassin game.
        "assassin" : {
            cost : 0,
            help : "!assassin join to join a game. !assassin leave to leave the game. !assassin rules to view the rules. !assassin to view progress and your target.",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Undefined breaks the switch statement
                if (commandData == undefined) {
                    commandData = "nothing";
                }
                
                //  Decide what to do
                switch (commandData.toLowerCase()) {
                    
                    //  Join the game
                    case "join" :
                        return assassin.register(sys.name(source));
                    
                    //  Leave the game
                    case "leave" :
                        return assassin.leave(sys.name(source));
                    
                    //  View the rules
                    case "rules" :
                        sys.sendHtmlMessage(source, "<hr>", chan);
                        assassin.sendMessage(source, "The rules to this game are:", chan);
                        sys.sendMessage(source, "1: Everyone is assigned one target to assassinate. Every assassination counts for one point.", chan);
                        sys.sendMessage(source, "2: If an assassin tries to assassinate you and you counter-kill, you get one point.", chan);
                        sys.sendMessage(source, "3: When a player is assassinated, the assassin takes on that player's target.", chan);
                        sys.sendMessage(source, "4: There are two winners: the last man standing and the highest scoring assassin.", chan);
                        sys.sendMessage(source, "5: Assassination attempts are done via battling. While not required, it makes the game more fun if the target doesn't know it is an assassination attempt until the battle starts.", chan);
                        sys.sendMessage(source, "6: If the game is decided with a disconnect, the game does not count and neither player is killed or awarded points.", chan);
                        sys.sendMessage(source, "7: Don't be cocky.", chan);
                        sys.sendHtmlMessage(source, "<hr>", chan);
                        return true;
                    
                    //  Just display depending on the mode
                    default:
                        switch (assassin.data.mode) {
                        
                            //  Show game stats as they are
                            case 2:
                                assassin.showAll(source, chan);
                                break;
                            
                            //  Show who has joined
                            case 1:
                                
                                sys.sendHtmlMessage(source, "<hr>", chan);
                                assassin.sendMessage(source, assassin.data.allplayers.length  + " are playing Assassin. " + (assassin.data.numplayers - assassin.data.allplayers.length) + " spots remaining." + (-1 == assassin.data.allplayers.indexOf(sys.name(source))?" Type !assassin join to join.":""), chan);
                                sys.sendHtmlMessage(source, "<hr>", chan);
                                break;
                            
                            //  Show end results of last game
                            case 0:
                                assassin.getResults(source, chan);
                                break;
                        }
                        return true;
                }
            }
        },
        
        //  Role playing commands cost PP
        "rpcommands" : {
            cost : 0,
            help : "View all Role Playing commands. All of these are free in the Role Playing channel.",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Simply display everything
                var showMessage="<br><center><b><font color='orange' size=+4 style='font-family:calibri'>Commands List</font></b></center><table width=100% style='background-color:qlineargradient(x1:0,y1:0,x2:0,y2:1,stop:0 white,stop:.25 orange,stop:.72 orange,stop:1 white); color:black'><tr><td width=10%></td><td width=15%></td><td></td></tr><tr><td><td></td><td></td><td></td></tr>";
                for (var c in RPCommands) {
                    showMessage+="<tr><td><center>" + RPCommands[c].cost + "pp</center></td><td><b>!" + c + "</b></td><td>" + RPCommands[c].help + "</td></tr>";
                }
                showMessage+="<tr><td></td><td></td></tr></table><br>";
                sys.sendHtmlMessage(source, showMessage, chan);
                return true;
            }
        }
    };

    //  These are for-fun commands that are free in the role playing channel
    RPCommands = {
        "rphelp" : {
            cost : 0,
            param : ["command"],
            help : "A detailed explanation of any Role Playing command.",
            run : function (source, chan, command, commandData, mcmd) {
                //  Display everything
                if (commandData == undefined) {
                    commandData = "rphelp";
                }
                var c = commandData.toLowerCase(), list;
                if (RPCommands[c] == undefined) {
                    CommandBot.sendMessage(source, "'!" + c + "' isn't a Role Playing command.", chan);
                    return false;
                }
                sys.sendHtmlMessage(source, "<hr>", chan);
                CommandBot.sendMessage(source, "Information about " + c + ":", chan);
                sys.sendMessage(source, RPCommands[c].help, chan);
                sys.sendMessage(source, "", chan);
                CommandBot.sendMessage(source, "Usage:", chan);
                if (RPCommands[c].param == undefined) {
                    sys.sendMessage(source, "!" + c, chan);
                } else {
                    sys.sendMessage(source, "!" + c + " " + RPCommands[c].param.join(":"), chan);
                }
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },
        
        //  Change your name in the role playing channel only
        "nick" : {
            cost : 10,
            help : "Change your name in the Role Playing channel. This doesn't affect your real name on the server.",
            param : ["new name (max length 20 characters)"],
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Make sure it's enabled
                if (!hash.get("cmd_nick")) {
                    CommandBot.sendMessage(source, "!nick is disabled right now.", chan);
                    return false;
                }
                
                //  It only works in one channel
                if (chan != rpchan) {
                    CommandBot.sendMessage(source, "You need to be in the Role Playing channel to use this command.", chan);
                    return false
                }
                
                //  Don't go into a bad name
                if (db.nameIsInappropriate(commandData)) {
                    return false;
                }
                
                //  Don't join the clan
                if (-1 < commandData.indexOf(clan.tagToString())) {
                    CommandBot.sendMessage(source, "Don't change into the clan!", chan);
                    return false;
                }
                
                //  Don't make a long name
                if (commandData.length > 20) {
                    CommandBot.sendMessage(source, "That name is too long.", chan);
                    return false;
                }
                
                //  Don't make a short name
                if (db.isEmptyString(commandData)) {
                    sys.sendMessage(source, "You have to be named something...", chan);
                    return false;
                }
                
                //  Finally do it
                NickBot.sendAll(sys.name(source) + " is now using the nickname " + db.htmlEscape(commandData) + " in the Role Playing channel!", chan);
                players[source].rpname = db.htmlEscape(commandData);
                return true;
            }
        },
        
        //  Revert nickname
        "nonick" : {
            cost : 0,
            help : "Revert to your old name.",
            run : function (source, chan, command, commandData, mcmd) {
                NickBot.sendAll(sys.name(source) + " is no longer using the nickname " + players[source].rpname, rpchan);
                players[source].rpname = false;
                return true;
            }
        },

        //  Burn target player
        "burn" :
        {
            cost : 30,
            param : ["name"],
            help : "Burn someone.",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Target player must exist
                if (target == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                
                //  Don't do it if we can't do it
                if (!hash.get("cmd_status")) {
                    CommandBot.sendMessage(source, "All status commands are disabled right now.", chan);
                    return false;
                }
                
                //  Display
                db.sendHtmlAll(source, "<img src=Themes/Classic/status/battle_status4.png><b><font color=red size=3>" + db.playerToString(target)+ " was burned by " + db.playerToString(source) + " <img src=Themes/Classic/status/battle_status4.png></font>", chan);
                return true;
            }
        },
        
        //  Works just like Burn
        "cure" : {
            cost : 30,
            param : ["name"],
            help : "Cure someone.",
            run : function (source, chan, command, commandData, mcmd) {
                if (target == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                if (!hash.get("cmd_status")) {
                    CommandBot.sendMessage(source, "All status commands are disabled right now.", chan);
                    return false;
                }
                db.sendHtmlAll(source, "<img src=Themes/Classic/status/battle_status2.png><b><font color=Black size=3> " + db.playerToString(source) + " used Heal Bell! " + db.playerToString(target)+ " was cured of all status problems. <img src=Themes/Classic/status/battle_status2.png></font>", chan);
                return true;
            }
        },
        
        //  Works just like burn
        "freeze" : {
            cost : 30,
            param : ["name"],
            help : "Freeze someone.",
            run : function (source, chan, command, commandData, mcmd) {
                if (target == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                if (!hash.get("cmd_status")) {
                    CommandBot.sendMessage(source, "All status commands are disabled right now.", chan);
                    return false;
                }
                db.sendHtmlAll(source, "<img src=Themes/Classic/status/battle_status3.png><b><font color=blue size=3> " + db.playerToString(target) + " was frozen by " + db.playerToString(source) + "</font><img src=Themes/Classic/status/battle_status3.png>", chan);
                return true;
            }
        },
        
        //  Works just like burn
        "paralyze" : {
            cost : 30,
            help : "Paralyze someone" ,
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
                if (target == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                if (!hash.get("cmd_status")) {
                    CommandBot.sendMessage(source, "All status commands are disabled right now.", chan);
                    return false;
                }
                db.sendHtmlAll(source, "<img src=Themes/Classic/status/battle_status1.png><b><font color=#f8d030 size=3> " + db.playerToString(target) + " was paralyzed by " + db.playerToString(source) + " </font><img src=Themes/Classic/status/battle_status1.png></font>", chan);
                return true;
            }
        },
        
        //  Works just like burn
        "poison" : {
            cost : 30,
            help : "Poison someone",
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
                if (target == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                if (!hash.get("cmd_status")) {
                    CommandBot.sendMessage(source, "All status commands are disabled right now.", chan);
                    return false;
                }
                db.sendHtmlAll(source, "<img src=Themes/Classic/status/battle_status5.png><b><font color=Purple size=3> " + db.playerToString(target) + " was poisoned by " + db.playerToString(source) + " </font><img src=Themes/Classic/status/battle_status5.png>", chan);
                return true;
            }
        },
                
        //  Flip a table
        "flip" : {
            cost : 15,
            help : "Flip a table",
            run : function (source, chan, command, commandData, mcmd) {
                db.sendHtmlAll(source, db.playerToString(source, true, (chan == rpchan)) + " (╯°□°）╯︵ ┻━┻", chan);
                return true;
            }
        },
        
        //  Shrug it off
        "idk" : {
            cost : 15,
            help : "Who knows?",
            run : function (source, chan, command, commandData, mcmd) {
                db.sendHtmlAll(source, db.playerToString(source, true, (chan == rpchan)) + "¯\\_(ツ)_/¯", chan);
                return true;
            }
        },
        
        //  One of the most important commands in chatrooms
        "me" : {
            cost : 5 ,
            help : "Talk in the third person",
            param : ["message"],
            run : function (source, chan, command, commandData, mcmd) {
            
                //  Don't do it if we're not allowed
                if (!hash.get("cmd_me")) {
                    CommandBot.sendMessage(source, "!me is disabled right now.", chan);
                    return false;
                }
                                
                //  Define the name for this context
                var sourcename;
                
                //  Check to see if we're using a role playing name
                if (chan == rpchan && players[source].rpname) {
                    sourcename = players[source].rpname;
                
                //  Check to see if we're using an imped name.
                } else if (players[source].impname) {
                    sourcename = players[source].impname;
                
                //  Just default to the regular name.
                } else {
                    sourcename = sys.name(source)
                }
                
                //  Display
                db.sendHtmlAll(source, "<font color=" + db.getColor(source) + "><timestamp/><i><font size=3>*** " + sourcename + " " + db.htmlEscape(commandData) + "</font></i></font>", chan);
                return true;
            }
        },
        
        //  Works the same as !me
        "my" : {
            cost : 5,
            help : "Talk in the third person.",
            param : ["message"],
            run : function (source, chan, command, commandData, mcmd) {
                if (!hash.get("cmd_my")) {
                    CommandBot.sendMessage(source, "!my is disabled right now.", chan);
                    return false;
                }
                
                //  Define the name for this context
                var sourcename;
                
                //  Check to see if we're using a role playing name
                if (chan == rpchan && players[source].rpname) {
                    sourcename = players[source].rpname;
                
                //  Check to see if we're using an imped name.
                } else if (players[source].impname) {
                    sourcename = players[source].impname;
                
                //  Just default to the regular name.
                } else {
                    sourcename = sys.name(source)
                }
                
                //  Keep our pig latin code; it won't run but the code is nice
                if (false && Config.debug) {
                    var sgmay = commandData.toLowerCase().split(/\W|_ /);
                    for (var i = 0; i < sgmay.length; i++) {
                        var word = sgmay[i], cons = "", repeat = true;
                        while (repeat) {
                            if (word.length == 0) break;
                            var c = word.charAt(0);
                            switch (c) {
                                case 'a': case 'e': case 'i': case 'o': case 'u':
                                    repeat = false;
                                    break;
                                default:
                                    cons += c;
                                    word = word.substring(1);
                                    break;
                            }
                        }
                        sgmay[i] = word + cons + "ay";
                    }
                    commandData = sgmay.join(" ");
                }
                db.sendHtmlAll(source, "<font color=" + db.getColor(source) + "><timestamp/><i><font size=3>*** " + sourcename + "'s " + db.htmlEscape(commandData) + "</font></i></font>", chan);
                return true;
            }
        },
        
        //  For those moments win
        "slap" : {
            cost : 20,
            help : "Slap someone",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Target player must exist
                if (target == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                
                //  Don't if we can't
                if (hash.get["cmd_slap"]) {
                    CommandBot.sendMessage(source, "That command is disabled.", chan);
                    return false;
                }
                
                //  Display
                CommandBot.sendAll(source, "<font color=black>" + db.playerToString(source, false, (chan == rpchan)) + " slaps " + db.playerToString(target, false, (chan == rpchan)) + " around a bit with a large trout.</font>", chan);
                return true;
            }
        },

        "imp" : {
            cost : 100,
            help : "Pick your name for a post",
            run : function (source, chan, command, commandData, mcmd) {
                if (clan.indexInClan(sys.name(source)) == -1) {
                    CommandBot.sendMessage(source, "Clan members only can use this command.", chan);
                    return false;
                }
                if (mcmd.length < 2) {
                    CommandBot.sendMessage(source, "Please use the format name:message", chan);
                    return false;
                }
                var n = mcmd[0];
                if (n.length < 4) {
                    CommandBot.sendMessage(source, "That name is too short.", chan);
                    return false;
                }
                if (16 < n.length) {
                    CommandBot.sendMessage(source, "That name is too long.", chan);
                    return false;
                }
                if (db.nameIsInappropriate(n)) {
                    CommandBot.sendMessage(source, "That name is inappropriate.", chan);
                    return false;
                }
                if (n.indexOf("[HH]") != -1) {
                    CommandBot.sendMessage(source, "Don't impersonate the clan.", chan);
                    return false;
                }
                if (sys.id(n) != undefined) {
                    CommandBot.sendMessage(source, "Someone is already logged in with that name.", chan);
                    return false;
                }
                if (Config.NoImp.indexOf(n) != -1) {
                    CommandBot.sendMessage(source, "That name is not allowed to be impersonated", chan);
                    return false;
                }
                var msg = commandData.substring(commandData.indexOf(":") + 1);
                if (msg.length < 1) {
                    CommandBot.sendMessage(source, "That message is too short.", chan);
                    return false;
                }
                sys.sendHtmlAll(db.playerToString(source, true, false, false, n) + " " + db.htmlEscape(msg), chan);
                return true;
            }
        }
    };
    
    //  These are commands used to manage tournaments and assassin
    TourCommands = {
        
        //  View the commands
        "tourcommands" : {
            cost : 0,
            help : "View all Tournament commands.",
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Display everything
                var showMessage="<br><center><b><font color='orange' size=+4 style='font-family:calibri'>Commands List</font></b></center><table width=100% style='background-color:qlineargradient(x1:0,y1:0,x2:0,y2:1,stop:0 white,stop:.25 orange,stop:.72 orange,stop:1 white); color:black'><tr><td width=10%></td><th width=15%>Command</th><th>Usage</th></tr><tr><td><td></td><td></td></tr>";
                for (var c in TourCommands) {
                    showMessage+="<tr><td></td><td><b>!" + c + "</b></td>";
                    if (TourCommands[c].param == undefined) {
                        showMessage += "<td></td></tr>";
                    } else {
                        showMessage += "<td>" + TourCommands[c].param.join(":") + "</td></tr>";
                    }
                }
                showMessage+="<tr><td></td><td></td></tr></table><br>";
                sys.sendHtmlMessage(source, showMessage, chan);
                return true;
            }
        },
        
        //  Start a tournament
        "tour" : {
            param : ["tier", "number of players", "prize"],
            run : function (source, chan, command, commandData, mcmd) {
                
                //  A tournament is already running
                if (typeof(tourmode) != "undefined" && tourmode > 0) {
                    TourBot.sendMessage(source, "Sorry, you are unable to start a tournament because one is still currently running.", chan);
                    return false;
                }
                
                //  Incorrect format
                if (mcmd.length < 3) {
                    TourBot.sendMessage(source, "Try '!tour TIER:PLAYERS:PRIZE'", main);
                    return false;
                }
                
                //  Parse the data
                prize = mcmd[2].toLowerCase();
                tournumber = parseInt(mcmd[1]);
                
                //  Enforce tournament length
                if (isNaN(tournumber) || tournumber <= 2) { 
                    TourBot.sendMessage(source, "You must specify a tournament size of 3 or more.", chan);
                    return false;
                }
                
                //  Make sure the tier exists
                var tier = sys.getTierList();
                var found = false;
                for (var x in tier) {
                    if (cmp(tier[x], mcmd[0])) {
                        tourtier = tier[x];
                        found = true;
                        break;
                    }
                }
                
                //  Tier doesn't exist
                if (!found) {
                    TourBot.sendMessage(source, "The server does not recognize the tier " + mcmd[0], chan);
                    return false;
                }
                
                //  Prepare a tournament
                tourmode = 1;
                tourmembers = [];
                tourbattlers = [];
                tourplayers = [];
                battlesStarted = [];
                battlesLost = [];
                var chans = [0];
                
                //  No prize is fine
                if (typeof(prize) == "undefined"){
                    prize = "No prize";
                }
                
                //  Display for everyone
                sys.sendHtmlAll("<hr>", main);
                sys.sendHtmlAll("<center><b><font color='#FF00CC' style='font-size: 14pt; font-family:calibri'>A "+tourtier+" Tournament has been started by <font color=" + db.getColor(source) + ">"+sys.name(source)+"!</font></font></b></center>", main);
                sys.sendAll("~~Server~~: " +tournumber+" people can join this tournament", main);
                TourBot.sendAll("Prize: "+db.htmlEscape(prize), main);
                CommandBot.sendAll(source, "Type !join to enter the tournament.", main);
                sys.sendHtmlAll("<hr>", main);
                return true;
            }
        },
        
        //  Change the number of participants
        "changecount" : {
            param : ["num"],
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Can't change in-progress tour size
                if (tourmode != 1) {
                    TourBot.sendMessage(source, "Unable to edit a tournament's size if not in sign-up phase.", chan);
                    return false;
                }
                
                //  Get the new count
                var count = parseInt(commandData);
                
                //  Enforce tour size on this count
                if (isNaN(count) || count < 3) {
                    TourBot.sendMessage(source, "Count must be a number greater than 3.", chan);
                    return false;
                }
                
                //  More people than new size (don't kick anyone out!)
                if (count < tourmembers.length) {
                    TourBot.sendMessage(source, "There are more people registered than that!", chan);
                    return false;
                }
                
                //  Change data
                tournumber = count;
                
                //  Display change
                sys.sendHtmlAll("<hr>", main);
                sys.sendHtmlAll(db.playerToString(source) + " changed the size of the Tournament to " + count + "!", main);
                sys.sendHtmlAll("<b>There are " + tourSpots() + " spots remaining!</b>", main);
                sys.sendHtmlAll("<b>Type !join to enter the tournament!</b>", main);
                sys.sendHtmlAll("<hr>", main);
                
                //  If there aren't any open spots anymore then start it
                if (tourSpots() == 0 ) {
                    tourmode = 2;
                    roundnumber = 0;
                    roundPairing();
                }
                return true;
            }
        },
        
        //  Kick someone out of the tournament
        "dq" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
                
                //  No tournament to DQ from
                if (tourmode == 0) {
                    TourBot.sendMessage(source, "Wait until the tournament has started.", chan);
                    return false;
                }
                
                //  Make sure the person is a battler
                var name2 = commandData.toLowerCase();
                
                //  DQ if so
                if (tourmembers.indexOf(name2) != -1) {
                    tourmembers.splice(tourmembers.indexOf(name2),1);
                    delete tourplayers[name2];
                    TourBot.sendAll(commandData + " was disqualified by " + db.playerToString(source) + "!", chan);
                    return true;
                }
                
                //  End this person's battle
                if (tourbattlers.indexOf(name2) != -1) {
                    battlesStarted[Math.floor(tourbattlers.indexOf(name2)/2)] = true;
                    TourBot.sendAll(commandData + " was disqualified by " + db.playerToString(source) + "!", chan);
                    tourBattleEnd(tourOpponent(name2), name2);
                    return true;
                }
                return false;
            }
        },
        
        //  Close a tournament
        "endtour" : {
            run : function (source, chan, command, commandData, mcmd) {
                //  Can only close tournaments that are running
                if (tourmode != 0) {
                
                    //  End it
                    tourmode = 0;
                    sys.sendHtmlAll("<hr>", main);
                    sys.sendHtmlAll(db.playerToString(source, true) + " closed the tournament.", main);
                    sys.sendHtmlAll("<hr>", main);
                    return true;
                }
                
                TourBot.sendMessage(source, "There is no tournament to end.", chan);
                return false;
            }
        },
        
        //  Push someone in manually
        "push" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
                
                //  No pushing in a non-existing tour or one in its sign-up phase
                if (tourmode != 2) {
                    TourBot.sendMessage(source, "Only push people into tournaments in progress.", chan);
                    return false;
                }
                
                //  Make sure target player exists
                if (target == undefined) {
                    TourBot.sendMessage(source, "No one is logged in with that name.", chan);
                    return false;
                }
                
                //  Make sure there is no duplicate entry
                if (isInTourney(commandData.toLowerCase())) {
                    TourBot.sendMessage(source, db.playerToString(target) + " is already in the tournament.", chan);
                    return false;
                }
                
                //  Force unidle
                sys.changeAway(target, false);
                
                //  Do the pushing
                tourmembers.push(commandData.toLowerCase());
                tourplayers[commandData.toLowerCase()] = commandData;
                TourBot.sendAll(db.playerToString(target)+ " was added to the tournament by " + db.playerToString(source) + ".", chan);
                return true;
            }
        },
        
        //  Restart an ongoing battle
        "restart" : {
            param : ["one of the players in the matchup"],
            run : function (source, chan, command, commandData, mcmd) {
            
                //  No ongoing battles if tour hasn't started
                if (tourmode != 2) {
                    TourBot.sendMesssage(source, "Wait until a tournament starts", chan);
                    return false;
                }
                
                //  Target player must exist
                if (target == undefined) {
                    TourBot.sendMessage(source, "No one is logged in with that name.", chan);
                    return false;
                }
                
                var name = commandData.toLowerCase();
                
                //  Make sure the player named is in an ongoing match
                if (tourbattlers.indexOf(name) != -1) {
                    
                    //  Forget the battle
                    battlesStarted[Math.floor(tourbattlers.indexOf(name)/2)] = false;
                    TourBot.sendAll(db.playerToString(target) + "'s match was restarted by " + db.playerToString(source) + "!", chan);
                    return true;
                }
                return false;
            }
        },
        
        //  Swap two people in a tournament
        "sub" : {
            param : ["name", "other name"],
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Tournament must be running
                if (tourmode != 2) {
                    TourBot.sendMessage(source, "Wait until a tournament starts", chan);
                    return false;
                }
                
                //  Swap only two players; make sure at least one is in the tour
                var players = commandData.split(':');
                if (!isInTourney(players[0].toLowerCase())
                 && !isInTourney(players[1].toLowerCase())) {
                    TourBot.sendMessage("Neither are in the tournament.", chan);
                    return false;
                }
                
                //  Display now while we have the chance
                TourBot.sendAll(players[0] + " and " + players[1] + " were exchanged places in the ongoing tournament by " + sys.name(source) + ".", 0, chan);
                
                //  Tour needs lowercase names
                var p1 = players[0].toLowerCase();
                var p2 = players[1].toLowerCase();
                
                //  Swap both of the names
                for (x in tourmembers) {
                    if (tourmembers[x] == p1) {
                        tourmembers[x] = p2;
                    } else {
                        if (tourmembers[x] == p2) {
                            tourmembers[x] = p1;
                        }
                    }
                }
                
                //  Swap them here too but cancel ongoing battles
                for (x in tourbattlers) {
                    if (tourbattlers[x] == p1) {
                        tourbattlers[x] = p2;
                        battlesStarted[Math.floor(x / 2)] = false;
                    } else {
                        if (tourbattlers[x] == p2) {
                            tourbattlers[x] = p1;
                            battlesStarted[Math.floor(x / 2)] = false;
                        }
                    }
                }
                
                //  If one is no longer in the tournament, forget that player
                if (!isInTourney(p1.toLowerCase())) {
                    tourplayers[p1] = players[0];
                    delete tourplayers[p2];
                } else {
                    if (!isInTourney(p2.toLowerCase())) {
                        tourplayers[p2] = players[1];
                        delete tourplayers[p1];
                    }
                }
                return true; 
            }
        },
        
        //  Start a game of assassin
        "startassassin" : {
            param : ["number of players"],
            run : function (source, chan, command, commandData, mcmd) {
                
                //  Only one game can be running
                if (assassin.data.mode != 0) {
                    assassin.sendMessage(source, "A game of Assassin is currently running.", chan);
                    return false;
                }
                
                //  Valid number of players must be given
                if (commandData == undefined || isNaN(commandData) || commandData < 4){
                    assassin.sendMessage(source, "Must specify a number of players larger than 3.", chan);
                    return false;
                }
                
                //  Forget everything
                assassin.clear();
                
                //  Set game to registration mode
                assassin.data.mode = 1;
                assassin.data.numplayers = commandData;
                
                //  Remember this in case the server restarts
                assassin.save();
                
                //  Display
                sys.sendHtmlAll("<hr>", main);
                sys.sendHtmlAll("<center><b><font color='" + Config.AssassinBot[1] + "' style='font-size: 14pt; font-family:calibri'>A new game of Assassin was been started by <font color=" + db.getColor(source) + ">"+sys.name(source)+"!</font></font></b></center>", main);
                sys.sendAll("~~Server~~: " + assassin.data.numplayers + " people can join this game.", main);
                assassin.sendAll("Type !assassin join to enter the game.", main);
                sys.sendAll("~~Server~~: To view the rules, type !assassin rules.", main);
                sys.sendHtmlAll("<hr>", main);
                return true;
            }
        },
        
        //  End the game =(
        "endassassin" : {
            run : function (source, chan, command, commandData, mcmd) {
                
                //   Only end a game that has started
                if (assassin.data.mode == 0) {
                    assassin.sendMessage(source, "No game of Assassin is currently running.", chan);
                    return false;
                }
                
                //   Display the game has ended
                sys.sendHtmlAll("<hr>", main);
                assassin.sendAll(sys.name(source) + " ended the game!", main);
                sys.sendHtmlAll("<hr>", main);
                
                //  Show the results of the game then end it
                if (assassin.data.mode == 2) {
                    assassin.showResults(main);
                    assassin.data.mode = 0;
                    assassin.save();
                }
                
                //  Or just forget it
                else {
                    assassin.clear();
                    assassin.save();
                }
                
                return true;
            }
        },
        
        //  Swap people in/out of the game
        "subassassin" : {
            param : ["to take out (this is CASE-SENSITIVE!)", "to replace (this is CASE-SENSTIVE!)"],
            run : function (source, chan, command, commandData, mcmd) {
                //  Stuff
                var takeout = mcmd[0];
                var putin = mcmd[1];
                
                //  Only take out a player
                var i = assassin.data.allplayers.indexOf(takeout);
                if (-1 == i) {
                    assassin.sendMessage(source, takeout + " isn't playing this round.", chan);
                    return false;
                }
                
                //  Only put in a nonplayer
                if (-1 < assassin.data.allplayers.indexOf(putin)) {
                    assassin.sendMessage(source, putin + " is already playing this round.", chan);
                    return false;
                }
                
                //  Make the swap
                assassin.data.allplayers[i] = putin;
                var j = assassin.data.players.indexOf(takeout);
                if (j != -1) {
                    assassin.data.players[j] = putin;
                }
                
                //  Display
                sys.sendHtmlAll("<hr>", main);
                assassin.sendAll(putin  + " replaced " + takeout + " in the Assassin game!", main);
                sys.sendAll("Players can view if their targets have changed with !assassin", main);
                sys.sendHtmlAll("<hr>", main);                
                assassin.save();
                return true;
            }
        }
        
    };
    
    //  These manage the party channel
    PartyCommands = {
        
        //  View them all
        "partycommands" : {
            help : "View all Party Host commands.",            
            run : function (source, chan, command, commandData, mcmd) {
            
                //  Display everything
                var showMessage="<br><center><b><font color='orange' size=+4 style='font-family:calibri'>Commands List</font></b></center><table width=100% style='background-color:qlineargradient(x1:0,y1:0,x2:0,y2:1,stop:0 white,stop:.25 orange,stop:.72 orange,stop:1 white); color:black'><tr><td width=10%></td><td width=15%></td><td></td></tr><tr><td><td></td><td></td></tr>";
                for (var c in PartyCommands) {
                    showMessage+="<tr><td></td><td><b>!" + c + "</b></td>";
                    if (PartyCommands[c].help == undefined) {
                        showMessage += "<td></td>";
                    } else {
                        showMessage += "<td>" + PartyCommands[c].help + "</td>";
                    }
                    if (PartyCommands[c].param == undefined) {
                        showMessage += "<td></td></tr>";
                    } else {
                        showMessage += "<td>" + PartyCommands[c].param.join(":") + "</td></tr>";
                    }
                }
                showMessage+="<tr><td></td><td></td></tr></table><br>";
                sys.sendHtmlMessage(source, showMessage, chan);
                CommandBot.sendMessage(source, "Note: Party Host commands only work in the Party channel.", chan);
                return true;
            }
        },
        
        //  Change a setting
        "pewpewpew" : {
            param : ["on/off"],
            help : "Toggle the swapping of names.",
            run : function (source, chan, command, commandData, mcmd) {
            
                //  Only change settings in the channel to make life easier on everyone
                if (chan != party) {
                    CommandBot.sendMessage(source, "Pary Host commands should only be used in the Party channel.", chan);
                    return false;
                }
                
                if (commandData == null) {
                    commandData = " ";
                }
                
                //  Change settings
                switch (commandData) {
                case "on" :
                    hash.set("party_pew", true);
                    break;
                case "off" :
                    hash.set("party_pew", false);
                    break;
                default:
                    hash.set("party_pew", ! hash.get("party_pew"));
                }
                
                //  Display
                CommandBot.sendAll(source, db.playerToString(source) + " " + (hash.get("party_pew") ? "en" : "dis") + "abled pewpewpew!", chan);
                
                return true;
            }
        },
        
        //  Works likew pewpewpew
        "piglatin" : {
            param : ["on/off"],
            help : "Toggle the oinkifying of text.",
            run : function (source, chan, command, commandData, mcmd) {
                if (chan != party) {
                    CommandBot.sendMessage(source, "Pary Host commands should only be used in the Party channel.", chan);
                    return false;
                }
                if (commandData == "on") {
                    hash.set("party_pig", true);
                } else if (commandData == "off") {
                    hash.set("party_pig", false);
                } else {
                    hash.set("party_pig", ! hash.get("party_pig"));
                }
                CommandBot.sendAll(source, db.playerToString(source) + " " + (hash.get("party_pig") ? "en" : "dis") + "abled pig latin!", chan);
                return true;
            }
        },
        
        //  Works the same as pewpewpe
        "colorize" : {
            param : ["on/off"],
            help : "Toggle the colorizing of text.",
            run : function (source, chan, command, commandData, mcmd) {
                if (chan != party) {
                    CommandBot.sendMessage(source, "Pary Host commands should only be used in the Party channel.", chan);
                    return false;
                }
                if (commandData == "on") {
                    hash.set("party_color", true);
                } else if (commandData == "off") {
                    hash.set("party_color", false);
                } else {
                    hash.set("party_color", ! hash.get("party_color"));
                }
                if (hash.get("party_color")) {
                    hash.set("party_rainbow", false);
                }
                CommandBot.sendAll(source, db.playerToString(source) + " " + (hash.get("party_color") ? "en" : "dis") + "abled colorizing!", chan);
                return true;
            }
        },
        
        //  Works the same as pewpewpew
        "rainbow" : {
            param : ["on/off"],
            help : "Toggle the rainbow in text.",
            run : function (source, chan, command, commandData, mcmd) {
                if (chan != party) {
                    CommandBot.sendMessage(source, "Pary Host commands should only be used in the Party channel.", chan);
                    return false;
                }
                if (commandData == "on") {
                    hash.set("party_rainbow", true);
                    hash.set("party_color", false);
                } else if (commandData == "off") {
                    hash.set("party_rainbow", false);
                } else {
                    hash.set("party_rainbow", ! hash.get("party_rainbow"));
                }
                if (hash.get("party_rainbow")) {
                    hash.set("party_color", false);
                }
                CommandBot.sendAll(source, db.playerToString(source) + " " + (hash.get("party_rainbow") ? "en" : "dis") + "abled the rainbow!", chan);
                return true;
            }
        },
        
        //  Works the same as pewpewpew
        "reverse" : {
            param : ["on/off"],
            help : ".tahc eht fo txet eht esreveR",
            run : function (source, chan, command, commandData, mcmd) {
                if (chan != party) {
                    CommandBot.sendMessage(source, "Pary Host commands should only be used in the Party channel.", chan);
                    return false;
                }
                if (commandData == "on") {
                    hash.set("party_reverse", true);
                } else if (commandData == "off") {
                    hash.set("party_reverse", false);
                } else {
                    hash.set("party_reverse", ! hash.get("party_reverse"));
                }
                CommandBot.sendAll(source, db.playerToString(source) + " " + (hash.get("party_reverse") ? "en" : "dis") + "abled reversing!", chan);
                return true;
            }
        }
    };
    
    //  These are moderation commands
    ModCommands = {
        //  Display commands
        "modcommands" : {
            cost : 0,
            help : "View all Moderator commands.",
            run : function (source, chan, command, commandData, mcmd) {
                var showMessage="<br><center><b><font color='orange' size=+4 style='font-family:calibri'>Commands List</font></b></center><table width=100% style='background-color:qlineargradient(x1:0,y1:0,x2:0,y2:1,stop:0 white,stop:.25 orange,stop:.72 orange,stop:1 white); color:black'><tr><td width=10%></td><td width=15%></td><td></td></tr><tr><td><td></td><td></td></tr>";
                for (var c in ModCommands) {
                    showMessage+="<tr><td></td><td><b>!" + c + "</b></td>";
                    if (ModCommands[c].param == undefined) {
                        showMessage += "<td></td></tr>";
                    } else {
                        showMessage += "<td>" + ModCommands[c].param.join(":") + "</td></tr>";
                    }
                }
                showMessage+="<tr><td></td><td></td></tr></table><br>";
                sys.sendHtmlMessage(source, showMessage, chan);
                return true;
            }
        },
        
        //  Mute someone without them knowing
        "confine" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
                //  Only confine people who exist
                if (target == undefined) {
                    CommandBot.sendMessage(source, "No player by this name.", chan);
                    return false;
                }
                
                //  Can't double confine
                if (players[target].confined) {
                    CommandBot.sendMessage(source, "That player is already confined.", chan);
                    return false;
                }
                
                //  Can't confine greater auth
                if (db.auth(source) < db.auth(target)) {
                    CommandBot.sendMessage(source, "Insufficient auth!", chan);
                    return false;
                }
                
                //  Do eet
                players[target].confined = true;
                CommandBot.sendMessage(source, "Confined " + sys.name(target) + "!", chan);
                return true;
            }
        },
        
        //  Or just have them relog
        "unconfine" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
            
                //  Must exist
                if (target == undefined) {
                    CommandBot.sendMessage(source, "No player by this name.", chan);
                    return false;
                }
                
                //  Must already be confined
                if (!players[target].confined) {
                    CommandBot.sendMessage(source, "That player is not confined.", chan);
                    return false;
                }
                
                //  Do eet
                players[target].confined = false;
                CommandBot.sendMessage(source, "Unconfined " + sys.name(target) + "!", chan);
                return true;
            }
        },
        
        //  Let someone into the clan
        "addmember" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
            
                //  Enforce restrictions because some auth don't pay attention
                if (commandData.length < 4 || !/^[A-Za-z0-9 _\!]*$/.test(commandData)) {
                    CommandBot.sendMessage(source, "Name is not in a valid format.", chan);
                }
                clan.addMember(source, commandData);
                return true;
            }
        },

        "delmember" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
                
                clan.removeMember(source, commandData);
                return true;
            }
        },

        "deauth" : {
            run : function (source, chan, command, commandData, mcmd) {

                sys.changeAuth(source, 0);
                sys.changeDbAuth(sys.name(source), 0);
                sys.sendHtmlAll("<font color=blue><timestamp/><b>" + sys.name(source) + " was self-demoted.</b></font>");
                return true;
            }
        },

        "announce" : {
            param : ["Big Text", "small text"],
            
            run : function (source, chan, command, commandData, mcmd) {
                if (commandData == null) {
                    CommandBot.sendMessage(source, "You can't announce  nothing!", chan);
                    return false;
                }
                
                var data = commandData.split(':');
                sys.sendHtmlAll("<hr>");
                sys.sendHtmlAll(db.playerToString(source) + " says:");
                sys.sendHtmlAll("<font size=10><b>" + data[0] + "</b></font>");
                if (data[1] != undefined) {
                    sys.sendAll(data[1]);
                }
                sys.sendHtmlAll("<hr>");
                sys.sendAll("");
                return true;
            }
        },


        "kick" : {
            param : ["name", "reason"],
            
            run : function (source, chan, command, commandData, mcmd, command, commandData, mcmd) {
                if (target == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                if (db.auth(source) <= db.auth(target)) {
                    CommandBot.sendMessage(source, "Insufficient Auth.", chan);
                    return false;
                }
                var srcname = sys.name(source);
                var tarname = sys.name(target);
                CommandBot.sendAll(source, db.playerToString(target) + " was kicked by " + db.playerToString(source) + ".");
                sys.kick(target);
                logs.log(srcname, command, tarname, (mcmd[1] == undefined ? "no reason" : mcmd[1]));
                return true;
            }
        },

        "ckick" : {
            param : ["name", "channel (optional, picks current channel otherwise)", "reason"],
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.existChannel(mcmd[1])) {
                    chan = sys.channelId(mcmd[1]);
                }
                if (db.auth(source) <= db.auth(target) || chan == main) {
                    CommandBot.sendMessage(source, "Insufficient auth.", chan);
                    return false;
                }
                if (sys.ip(target) == undefined) {
                    CommandBot.sendMessage(source, "Target doesn't exist.", chan);
                    return false;
                }
                var srcname = sys.name(source);
                var tarname = sys.name(target);
                CommandBot.sendMessage(source, db.playerToString(target) + " was kicked from the channel by " + db.playerToString(source), chan);
                sys.kick(target, chan);
                logs.log(srcname, command, tarname, (mcmd[2] == undefined ? "no reason" : mcmd[2]));
                return true;
            }
        },

        "forcerules" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {

                if (target == undefined) {
                    CommandBot.sendMessage(source, "Must force rules to a real person.", chan);
                    return false;
                }
                var showMessage="<br><center><font color='red' size=+4>The HH Rulebook</font></center><br><table width=100% style='background-color:qlineargradient(x1:0,y1:0,x2:0,y2:1,stop:0 white,stop:0.1 red,stop:0.25 black,stop:0.75 black,stop:0.9 red,stop:1 white); color:white'><tr><td width= 5%></td><td></td></tr><tr><td></td><td></td></tr>";
                for (var x = 0; x < Config.Rules.length; x++) {
                    showMessage+="<tr><td><b><center>" + (x + 1) + ":</center></b></td><td>" + Config.Rules[x] + "</td></tr>";
                }
                showMessage+="<tr><td></td><td></td></tr><tr><td></td><td></td></tr></table>";
                sys.sendHtmlMessage(target, showMessage);
                return true;
            }
        },

        "lookup" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.dbIp(commandData) == undefined) {
                    CommandBot.sendMessage(source, "Target doesn't exist!", chan);
                    return false;
                }
                CommandBot.sendMessage(source, "Information of player " + commandData + ":", chan);
                sys.sendMessage(source, "IP: " + sys.dbIp(commandData), chan);
                sys.sendMessage(source, "Auth Level: " + sys.dbAuth(commandData), chan);
                sys.sendMessage(source, "Max Auth: " + sys.maxAuth(commandData), chan);
                sys.sendMessage(source, "Aliases: " + sys.aliases(sys.dbIp(commandData)), chan);
                sys.sendMessage(source, "Number of aliases: " + sys.aliases(sys.dbIp(commandData)).length, chan); 
                sys.sendMessage(source, "Registered: " + sys.dbRegistered(commandData), chan);
                sys.sendMessage(source, "Logged In: " + (target != undefined), chan);
                if (target != undefined) {
                    var channames = [];
                    var channels = sys.channelsOfPlayer(target);
                    for (var i = 0; i < channels.length; i++) {
                        channames.push(sys.channel(channels[i]));
                    }
                    CommandBot.sendMessage(source, commandData + " is in channels: " + channames.join(", "), chan);
                }
                return true;
            }
        },

        "iplookup" : {
            param : ["ip address"],
            run : function (source, chan, command, commandData, mcmd) {

                if (commandData == undefined) {
                    CommandBot.sendMessage(source, "Must provide an IP address.", chan);
                    return false;
                }
                var ipsplit = commandData.split(".");
                if (ipsplit.length != 4) {
                    CommandBot.sendMessage(source, "No correctly formatted IP is provided", chan);
                    return false;
                }
                var ip = ipsplit[0] + "." + ipsplit[1] + "." + ipsplit[2] + "." + ipsplit[3],
                    aliases = sys.aliases(ip);
                if (aliases.length == 0) {
                    CommandBot.sendMessage(source, "No aliases of IP " + ip + " exist.", chan);
                } else {
                    CommandBot.sendMessage(source, "Aliases of IP " + ip + ": " + aliases.join(", "), chan);
                }
                return true;
            }
        },

        "mutelist" : {
            run : function (source, chan, command, commandData, mcmd) {

                mutes.display(source, chan);
                return true;
            }
        },

        "mute" : {
            param : ["name", "reason", "time"],
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.dbIp(mcmd[0]) == undefined) {
                    CommandBot.sendMessage(source, "This person does not exist.", chan);
                    return false;
                }
                if (sys.id(mcmd[0]) !== undefined) {
                    if (db.auth(source) < db.auth(sys.id(mcmd[0])))  {
                        CommandBot.sendMessage(source, "Insufficient auth.", chan);
                        return false;
                    }
                } else if (db.auth(source) < sys.dbAuth(mcmd[0])) {
                    CommandBot.sendMessage(source, "Insufficient auth.", chan);
                    return false;
                }
                if (mcmd[1] == undefined || mcmd[1].length < 4) {
                    CommandBot.sendMessage(source, "Giving a reason is required.", chan);
                    return false;
                }
                if (isNaN(mcmd[2])) {
                    CommandBot.sendMessage(source, "Use the right structure. '!mute name:reason(:time)'.", chan);
                    return false;
                }
                var time = (mcmd[2] == undefined) ? 5 : mcmd[2];
                var target = (sys.id(mcmd[0]) == undefined) ? mcmd[0] : db.playerToString(sys.id(mcmd[0]));
                mutes.mute(sys.name(source), sys.dbIp(mcmd[0]), mcmd[1], time);
                CommandBot.sendAll(source, db.playerToString(source) + " muted " + target + ". (Reason: " + mcmd[1] + ". Duration: " + db.getTimeString(time*60) + ")", -1);
                logs.log(sys.name(source), command + ":" + db.getTimeString(time*60) + "", target, mcmd[1]);
                return true;
            }
        },

        "unmute" : {
            param : ["name", "reason"],
            run : function (source, chan, command, commandData, mcmd) {
//            CommandBot.sendMessage(source, "This command is disabled. Don't waste your life taking things back.", chan);
//            return true;
                if (sys.dbIp(mcmd[0]) == undefined) {
                    CommandBot.sendMessage(source, "This person does not exist.", chan);
                    return false;
                }
                var ip = sys.dbIp(mcmd[0]);
                if (!mutes.isMuted(id)) {
                    sys.sendMessage(source, "That player is not muted...", chan);
                    return false;
                }
                mutes.unmute(ip);
                var name = (target == undefined) ? commandData : db.playerToString(target);
                CommandBot.sendAll(source, name + " was unmuted by " + db.playerToString(source) + ".", -1);
                logs.log(sys.name(source), command, commandData, "no reason");
                return true;
            }
        },

        "changename" : {
            param : ["target", "newname", "reason"],
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.id(mcmd[0])==undefined) {
                    CommandBot.sendMessage(source, "Target does not exist.", chan);
                    return false;
                }
                if (sys.dbAuth(mcmd[0]) < sys.dbAuth(mcmd[1])) {
                    CommandBot.sendMessage(source, "Don't change into higher auuth.", chan);
                    return false;
                }
                if (source == sys.id(mcmd[0])) {
                    CommandBot.sendMessage(source, "Your name is fine!", chan);
                    return false;
                }
                if (0 < db.auth(sys.id(mcmd[0]))) {
                    CommandBot.sendMessage(source, "Auth shouldn't have bad names.", chan);
                    return false;
                }
                if (mcmd[1] == undefined) {
                    CommandBot.sendMessage(source, "New name must be defined.", chan);
                    return false;
                }
                if (db.nameIsInappropriate(mcmd[1])) {
                    CommandBot.sendMessage(source, mcmd[1] + " is not appropriate for of name.", chan);
                    return false;
                }
                if (-1 < mcmd[1].indexOf(clan.tagToString())) {
                    CommandBot.sendMessage(source, "Don't change into the clan!", chan);
                    return false;
                }
                if (20 < mcmd[1].length) {
                    CommandBot.sendMessage(source, "That name is too long.", chan);
                    return false;
                }
                CommandBot.sendAll(source, db.playerToString(source) + " set " + db.playerToString(sys.id(mcmd[0])) + "'s name to " + mcmd[1] + "!", -1);
                sys.changeName(sys.id(mcmd[0]), mcmd[1]);
                logs.log(sys.name(source), command + ": to " + mcmd[1], mcmd[0], mcmd[2] == undefined ? "no reason" : mcmd[2]);
                return true;
            }
        },

        "switch" : {
            param : ["key", "on/off (optional, sets to opposite value if not set)"],
            
            run : function (source, chan, command, commandData, mcmd) {
                var switches = ["attack", "facepalm", "grumble", "me", "my", "nick", "ping", "slap", "status", "meme"];
                if (-1 == switches.indexOf(mcmd[0])) {
                    CommandBot.sendMessage(source, "Improper switch. May only switch " + switches.join(", "), chan);
                    return false;
                }
                var key = "cmd_" + mcmd[0];
                if (mcmd[1] == "on") {
                    hash.set(key, true);
                } else {
                    if (mcmd[1] == "off") {
                        hash.set(key, false);
                    } else {
                        hash.set(key, !hash.get(key));
                    }
                }
                if (mcmd[0] == "meme") {
                    CommandBot.sendAll(source, db.playerToString(source) + (hash.get(key) ? " en" : " dis") + "abled posting pictures to chat.", -1);
                }
                else {
                    CommandBot.sendAll(source, db.playerToString(source) + (hash.get(key) ? " en" : " dis") + "abled '!" + key.substring(4) + "'.", -1);
                }
                return true;
            }
        },

        "skittylovesyou" : {
            run : function (source, chan, command, commandData, mcmd) {

                sys.sendHtmlAll("<img src='pokemon:num=300&shiny=false&gender=female&back=false&gen=3'/><font size=48 color='#ff00cc'>Skitty loves you too!</font><img src='pokemon:num=300&shiny=false&gender=female&back=false&gen=3'/>", chan);
                return true;
            }
        },

        "allowstaffchan" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.dbIp(commandData) == undefined) {
                    CommandBot.sendMessage(source, "Target doesn't exist.", chan);
                    return false;
                }
                var name = commandData.toLowerCase(),
                    list = hash.get("allowstaffchan"),
                    index = list.indexOf(name);
                if (-1 < index) {
                    CommandBot.sendMessage(source, commandData + " is already allowed into the staff channel.", chan);
                    return false;
                }
                list.push(name);
                hash.set("allowstaffchan", list);
                Guard.sendAll(commandData + " was invited to " + sys.channel(staffchan) + " by " + db.playerToString(source) + ".", -1);
                return true;
            }
        },

        "disallowstaffchan" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {
                var name = commandData.toLowerCase(),
                    list = hash.get("allowstaffchan"),
                    index = list.indexOf(name);
                
                if (-1 == index) {
                    CommandBot.sendMessage(source, commandData + " already isn't allowed in the staff channel.", chan);
                    return false;
                }
                
                list.splice(index, 1);
                hash.set("allowstaffchan", list);
                Guard.sendAll(commandData + " is no longer allowed in " + sys.channel(staffchan) + ".", -1);
                return true;
            }
        },

        "staffchanlist" : {
            run : function (source, chan, command, commandData, mcmd) {
                sys.sendHtmlMessage(source, "<hr>", chan);
                Guard.sendMessage(source, "Staff Channel List:", chan);
                sys.sendMessage(source, hash.get("allowstaffchan").join(", "), chan);
                sys.sendHtmlMessage(source, "<hr>", chan);
                return true;
            }
        },
        
        
        "silence" : {
            param : ["reason"],
            run : function (source, chan, command, commandData, mcmd) {

                if (hash.get("silence")) {
                    CommandBot.sendMessage(source, "Silence is already on.", chan);
                    return false;
                }
                CommandBot.sendAll(source, db.playerToString(source) + " silenced the chat.", -1);
                hash.set("silence", true);
                logs.log(sys.name(source), command, "everyone", commandData == undefined ? "no reason" : commandData);
                return true;
            }
        },

        "unsilence" : {
            run : function (source, chan, command, commandData, mcmd) {

                if (!hash.get("silence")) {
                    CommandBot.sendMessage(source, "Silence isn't on.", chan);
                    return false;
                }
                CommandBot.sendAll(source, db.playerToString(source) + " unsilenced the chat. Time to talk!", -1);
                hash.set("silence", false);
                logs.log(sys.name(source), command, "everyone", commandData == undefined ? "no reason" : commandData);
                return true;
            }
        },
        
        "html" : {
            param : ["HTML"],
            run : function (source, chan, command, commandData, mcmd) {

                CommandBot.sendAll(source, db.playerToString(source) + " posted the following HTML:", chan);
                sys.sendHtmlAll(commandData + "<br>", chan);
                return true;
            }
        }
    };
    
    //  These are higher-tier moderation commands
    AdminCommands = {
        "admincommands" : {
            cost : 0,
            help : "View all Admin commands.",
            run : function (source, chan, command, commandData, mcmd) {

                var showMessage="<br><center><b><font color='orange' size=+4 style='font-family:calibri'>Commands List</font></b></center><table width=100% style='background-color:qlineargradient(x1:0,y1:0,x2:0,y2:1,stop:0 white,stop:.25 orange,stop:.72 orange,stop:1 white); color:black'><tr><td width=10%></td><td width=15%></td><td></td></tr><tr><td><td></td><td></td></tr>";
                for (var c in AdminCommands) {
                    showMessage+="<tr><td></td><td><b>!" + c + "</b></td>";
                    if (AdminCommands[c].param == undefined) {
                        showMessage += "<td></td></tr>";
                    } else {
                        showMessage += "<td>" + AdminCommands[c].param.join(":") + "</td></tr>";
                    }
                }
                showMessage+="<tr><td></td><td></td></tr></table><br>";
                sys.sendHtmlMessage(source, showMessage, chan);
                return true;
            }
        },


        "releasedw" : {
            param : ["Pokemon"],
            run : function (source, chan, command, commandData, mcmd) {

                if (db.auth(source) < 3 && sys.name(source) != Config.TierOwner) {
                    CommandBot.sendMessage(source, "Insufficient auth.", chan);
                    return true;
                }
                if (sys.pokeNum(commandData) == undefined) {
                    CommandBot.sendMessage(source, "That Pokemon does not exist.", chan);
                    return false;
                }
                var name = sys.pokemon(sys.pokeNum(commandData)),
                    pokes = hash.get("unreleasedPokes");
                var i = pokes.indexOf(name);
                if (-1 == i) {
                    CommandBot.sendMessage(source, "That Pokemon's ability is already released.", chan);
                    return false;
                }
                pokes.splice(i, 1);
                hash.set("unreleasedPokes", pokes);
                TierBot.sendAll(name + "'s hidden ability is released!", main);
                return true;
            }
        },

        "removedw" : {
            param : ["Pokemon"],
            run : function (source, chan, command, commandData, mcmd) {

                if (db.auth(source) < 3 && sys.name(source) != Config.TierOwner) {
                    CommandBot.sendMessage(source, "Insufficient auth.", chan);
                    return true;
                }
                if (sys.pokeNum(commandData) == undefined) {
                    CommandBot.sendMessage(source, "That Pokemon does not exist.", chan);
                    return false;
                }
                var name = sys.pokemon(sys.pokeNum(commandData)),
                    pokes = hash.get("unreleasedPokes");
                var i = pokes.indexOf(name);
                if (-1 < i) {
                    CommandBot.sendMessage(source, "That Pokemon's ability is not released.", chan);
                    return false;
                }
                pokes.push(name);
                hash.set("unreleasedPokes", pokes);
                TierBot.sendAll(name + "'s hidden ability is no longer released!");
                return true;
            }
        },

        "ban" : {
            param : ["name", "reason"],
            run : function (source, chan, command, commandData, mcmd) {
                var ip = sys.dbIp(mcmd[0]);
                if (ip == undefined) {
                    CommandBot.sendMessage(source, "No player exists by this name.", chan);
                    return false;
                }
                if (db.auth(source) <= db.auth(mcmd[0])) {
                    CommandBot.sendMessage(source, "Insufficent auth.", chan);
                    return false;
                }
                banlist = sys.banList()
                for (a in banlist) {
                    if (i == sys.dbIp(banlist[a])) {
                        CommandBot.sendMessage(source, mcmd[0] + " is already banned.", chan);
                        return false;
                    }
                }
                sys.sendHtmlAll("<font color=red><b>" + mcmd[0] + " was banned by " + sys.name(source) + ".</b></font>");
                if (sys.id(mcmd[0]) != undefined) {
                    sys.kick(sys.id(mcmd[0]));
                }
                sys.ban(mcmd[0]);
                logs.log(sys.name(source), command, mcmd[0], mcmd[1] == undefined ? "no reason" : mcmd[1]);
                return true;
            }
        },

        "unban" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.dbIp(mcmd[0]) == undefined) {
                    CommandBot.sendMessage(source, "No player exists by this name!", chan);
                    return false;
                }
                banlist = sys.banList()
                for (a in banlist) {
                    if (sys.dbIp(mcmd[0]) == sys.dbIp(banlist[a])) {
                        sys.unban(mcmd[0]);
                        CommandBot.sendAll(source, db.playerToString(source) + " unbanned " + mcmd[0] + ".", -1);
                        logs.log(sys.name(source), command, mcmd[0], mcmd[1] == undefined ? "no reason" : mcmd[1]);
                        return true;
                    }
                }
                CommandBot.sendMessage(source, "No banned player by that name;", chan);
                return false;
            }
        },

        "clearchat" : {
            param : ["channel", "reason"],
            run : function (source, chan, command, commandData, mcmd) {

                if (mcmd[0] != undefined) {
                    chan = sys.channelId(mcmd[0]);
                }
                if (!sys.existChannel(sys.channel(chan))) {
                    CommandBot.sendMessage(source, "Specify a channel.", chan);
                    return false;
                }
                for (var c = 0; c < 2999; c++) {
                    sys.sendAll("", chan);
                }
                CommandBot.sendAll(source, db.playerToString(source) + " cleared the chat in the channel: <b><font color=" + db.channelColor(chan) + ">" + sys.channel(chan) + "</b></font>!", -1);
                logs.log(sys.name(source), command, "everyone", mcmd[1] == undefined ? "no reason" : mcmd[1])
                return true;
            }
        },

        "rb" : {
            param : ["IP range in the form __.__.__.__ (last two can just be 0)", "reason"],
            run : function (source, chan, command, commandData, mcmd) {
                if (rangebans.ban(mcmd[0])) {
                    Guard.sendAll("IP " + mcmd[0] + " was rangebanned.", -1);
                    logs.log(sys.name(source), command, mcmd[0], mcmd[1] == undefined ? "no reason" : mcmd[1]);
                    return true;
                }
                Guard.sendMessage(source, "Cannot ban IP " + mcmd[0] + ". Maybe it's already banned?", chan);
                return false;
            }
        },

        "unrb" : {
            param : ["IP"],
            run : function (source, chan, command, commandData, mcmd) {

                if (rangebans.unban(mcmd[0])) {
                    Guard.sendAll("IP " + mcmd[0] + " is no longer rangebanned.", -1);
                    logs.log(sys.name(source), command, mcmd[0], mcmd[1] == undefined ? "no reason" : mcmd[1]);
                    return true;
                }
                Guard.sendMessage(source, "Cannot unban IP " + mcmd[0] + ". Maybe it's not banned?", chan);
                return false;
            }
        },

        "rblist" : {
            run : function (source, chan, command, commandData, mcmd) {

                rangebans.display(source);
                return true;
            }
        },

        "ipban" : {
            run : function (source, chan, commmand, commandData, mcmd) {
                if (!ipbans.ban(mcmd[0])) {
                    Guard.sendMessage(source, "Cannot ban IP " + mcmd[0], chan);
                    return false;
                }
                Guard.sendAll(source, "IP " + mcmd[0] + " was ipbanned.", main);
                return true;
            }
        },

        "ipunban" : {
            run : function (source, chan, command, commandData, mcmd) {
                if (!ipbans.unban(mcmd[0])) {
                    Guard.sendMessage(source, "Cannot unban IP " + mcmd[0], chan);
                    return false;
                }
                Guard.sendAll(source, "IP " + mcmd[0] + " is no longer ipbanned.", main);
                return true;
            }
        },

        "iplist" : {
            run : function (source, chan, command, commandData, mcmd) {
                ipbans.display(source);
            }
        },

        "nowelcome" : {
            run : function (source, chan, command, commandData, mcmd) {

                hash.set("nowelcome", !hash.get("nowelcome"));
                WelcomeBot.sendWelcomeAll("Welcome Messages have been toggled.", -1);
                return true;
            }
        },

        "lockdown" : {
            run : function (source, chan, command, commandData, mcmd) {

                hash.set("lockdown", !hash.get("lockdown"));
                Guard.sendAll("This server is " + (hash.get("lockdown")?"now":"no longer") + " on clan-only lockdown.", -1);
                return true;
            }
        },
        
        "newjuggernaut" : {
            param : ["name"],
            
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.dbIp(commandData) == undefined){
                    CommandBot.sendMessage(source, "Target does not exist.", chan);
                    return false;
                }
                
                if (source == target) {
                    CommandBot.sendMessage(source, "Don't cheat.", chan);
                    return false;
                }
                juggernaut.newJuggernaut(commandData);
                return true;
            }
        },

        "showteam" : {
            param : ["name"]
            ,
            run : function (source, chan)    //Uses the PO Main code
            {
                if (target == undefined) {
                    CommandBot.sendMessage(source, "That player doesn't exist.", chan);
                    return false;
                }
                var t= [];
                for (var i = 0; i < sys.teamCount(target); i++) {
                    t.push(i);
                }
                var teams = t

                //  Lambda functions
                .map (
                    function (index) { return db.importable(target, index); },
                    this)
                .filter(
                        function (data) { return data.length > 0; }
                    )
                .map (
                    function (team) { return "<td><pre>" + team.join("<br>") + "</pre></td>"; }
                ).join("");

                if (teams) {
                    sys.sendHtmlMessage(source, "<table><tr>" + teams + "</tr></table>", chan);
                    CommandBot.sendAll(source, db.playerToString(source) + " viewed " + db.playerToString(target) + "'s teams.", main);
                    return true;
                } else {
                    CommandBot.sendMessage(source, "That player has no teams with valid pokemon.", chan);
                    return false;
                }
            }
        },
        
        "lmgtfy" : {
            param : ["query"],
            run : function (source, chan, command, commandData, mcmd) {

                if (commandData == undefined) {
                    CommandBot.sendMessage(source, "You must search for something.", chan);
                    return false;
                }
                CommandBot.sendAll(source, "After extensive research, " + db.playerToString(source) + " is ready to reveal <a href='http://lmgtfy.com/?q=" + commandData + "'>" + commandData + "</a></font>", chan);
                return true;
            }
        },
        
        "motd" : {
            param : ["new message"],
            run : function (source, chan, command, commandData, mcmd) {
                hash.set("motd", commandData);
                CommandBot.sendAll(source, db.playerToString(source) + " changed the Message of the Day to " + commandData, -1);
                return true;
            }
        },
        
        "authnote" : {
            param : ["new message"],
            run : function (source, chan, command, commandData, mcmd) {
                hash.set("authnote", commandData);
                sys.sendMessage(source, "~~Server~~: Auth note set to: " + commandData, chan);
                return true;
            }
        }
    };
    
    //  These are commands only an owner shold have to use
    OwnerCommands = {
        "ownercommands" : {
            help : "View all Admin commands.",
            run : function (source, chan, command, commandData, mcmd) {

                var showMessage="<br><center><b><font color='orange' size=+4 style='font-family:calibri'>Commands List</font></b></center><table width=100% style='background-color:qlineargradient(x1:0,y1:0,x2:0,y2:1,stop:0 white,stop:.25 orange,stop:.72 orange,stop:1 white); color:black'><tr><td width=10%></td><td width=15%></td><td></td></tr><tr><td><td></td><td></td></tr>";
                for (var c in OwnerCommands) {
                    showMessage+="<tr><td></td><td><b>!" + c + "</b></td>";
                    if (OwnerCommands[c].param == undefined) {
                        showMessage += "<td></td></tr>";
                    } else {
                        showMessage += "<td>" + OwnerCommands[c].param.join(":") + "</td></tr>";
                    }
                }
                showMessage+="<tr></tr></table><br>";
                sys.sendHtmlMessage(source, showMessage, chan);
                return true;
            }
        },

        
  
        "mod" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.dbIp(commandData) == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                if (!sys.dbRegistered(commandData)) {
                    CommandBot.sendMessage(source, "This person isn't registered.");
                    return false;
                }
                if (db.auth(source) <= sys.dbAuth(commandData)) {
                    CommandBot.sendMessage(source, "Insufficient auth.", chan);
                    return false;
                }
                if (target != undefined) {
                    sys.sendHtmlAll("<font color=blue><b><font size=3>" + sys.name(target) + " is now a moderator.</font>");
                    sys.changeAuth(target, 1);
                } else {
                    sys.sendHtmlAll("<font color=blue><b><font size=3>" + commandData + " is now a moderator.</font>");
                }
                sys.changeDbAuth(commandData, 1);
                return true;
            }
        },

        "user" : {
            param : ["name"],
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.dbIp(commandData) == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                }
                if (db.auth(source) <= sys.dbAuth(commandData)) {
                    CommandBot.sendMessage(source, "Insufficient auth.", chan);
                    return false;
                }
                if (2 < sys.dbAuth(commandData)) {
                    CommandBot.sendMessage(source, "Only the server can modify Owner auth.", chan);
                    return false;
                }
                if (target != undefined) {
                    sys.sendHtmlAll("<font color=blue><b><font size=3>" + sys.name(target) + " was usered.</font>");
                    sys.changeAuth(target, 0);
                } else {
                    sys.sendHtmlAll("<font color=blue><b><font size=3>" + commandData + " was usered.</font>");
                }
                sys.changeDbAuth(commandData, 0);
                return true;
            }
        },

        "addmegauser" : {
            run : function (source, chan, command, commandData, mcmd) {
                var name = commandData.toLowerCase(),
                    list = hash.get("megauser"),
                    index = list.indexOf(name);
                if (-1 < index) {
                    CommandBot.sendMessage(source, commandData + " is already megauser.", chan);
                    return false;
                }
                
                list.push(name);
                hash.set("megauser", list);
                
                var dispname = (target == undefined) ? "<b>" + commandData + "</b>": db.playerToString(target);
                
                TourBot.sendAll("</font>" + dispname + "'s Usernite is reacting with the Server's Mega Blunt!", -1);
                TourBot.sendAll("</font>" + dispname + " can now host tournaments!", -1);
                
                return true;
            }
        },

        "delmegauser" : {
            run : function (source, chan, command, commandData, mcmd) {
                var name = commandData.toLowerCase(),
                    list = hash.get("megauser"),
                    index = list.indexOf(name);
                if (-1 == index) {
                    CommandBot.sendMessage(source, commandData + " isn't megauser.", chan);
                    return false;
                }
                
                list.splice(index, 1);
                hash.set("megauser", list);
                
                var dispname = (target == undefined) ? "<b>" + commandData + "</b>": db.playerToString(target);
                
                TourBot.sendAll("</font>" + dispname + " can no longer host tournaments!", -1);
                
                return true;
            }
        },

        "addpartyhost" : {
            run : function (source, chan, command, commandData, mcmd) {
                var name = commandData.toLowerCase(),
                    list = hash.get("partyhost"),
                    index = list.indexOf(name);
                if (-1 < index) {
                    CommandBot.sendMessage(source, commandData + " is already a Party Host.", chan);
                    return false;
                }
                
                list.push(name);
                hash.set("partyhost", list);
                
                var dispname = (target == undefined) ? "<b>" + commandData + "</b>": db.playerToString(target);
                
                TourBot.sendAll("</font>" + dispname + " is now a Party Host!", -1);
                
                return true;
            }
        },

        "delpartyhost" : {
            run : function (source, chan, command, commandData, mcmd) {
                var name = commandData.toLowerCase(),
                    list = hash.get("megauser"),
                    index = list.indexOf(name);
                if (-1 == index) {
                    CommandBot.sendMessage(source, commandData + " isn't a Party Host.", chan);
                    return false;
                }
                
                list.splice(index, 1);
                hash.set("partyhost", list);
                
                var dispname = (target == undefined) ? "<b>" + commandData + "</b>": db.playerToString(target);
                
                TourBot.sendAll("</font>" + dispname + " is no longer a Party Host!", -1);
                
                return true;
            }
        },

  
        "admin" : {
            param : ["target"],
            run : function (source, chan, command, commandData, mcmd) {

                if (sys.dbIp(commandData) == undefined) {
                    CommandBot.sendMessage(source, "This person doesn't exist.", chan);
                    return false;
                } 
                if (!sys.dbRegistered(commandData)) {
                    CommandBot.sendMessage(source, "This person isn't registered.");
                    return false;
                }
                if (2 < sys.dbAuth(commandData)) {
                    CommandBot.sendMessage(source, "Only the server can modify Owner auth.", chan);
                    return false;
                }
                if (target != undefined) {
                    sys.sendHtmlAll("<font color=blue><b><font size=3>" + sys.name(target) + " is now an administrator.</font>");
                    sys.changeAuth(target, 2);
                } else {
                    sys.sendHtmlAll("<font color=blue><b><font size=3>" + commandData + " is now an administrator.</font>");
                }
                sys.changeDbAuth(commandData, 2);
                return true;
            }
        },

        "bannerdirection" : {
            run : function (source, chan, command, commandData, mcmd) {

                Banner.data.GradientIsHorizontal = !Banner.data.GradientIsHorizontal;
                Banner.update();
                return true;
            }
        },

        "bannertextcolor" : {
            param : ["color (either color or name)"],
            run : function (source, chan, command, commandData, mcmd) {

                Banner.data.TextColor = commandData;
                Banner.update();
                return true;
            }
        },

        "bannerbackground" : {
            param : ["color 1 (either hex code or name)", "color 2", "color 3"],
            run : function (source, chan, command, commandData, mcmd) {

                if (mcmd.length < 3) {
                    CommandBot.sendMessage(source, "Not enough arguments to call bannerbackground.", chan);
                    return false;
                }
                Banner.data.GradientColors[0]=mcmd[0];
                Banner.data.GradientColors[1]=mcmd[1];
                Banner.data.GradientColors[2]=mcmd[1];
                Banner.data.GradientColors[3]=mcmd[2];
                Banner.update();
                return true;
            }
        },

        "bannermsg" : {
            param : ["linenumber", "HTML"],
            run : function (source, chan, command, commandData, mcmd) {

                if (isNaN(mcmd[0]) || mcmd[0] < 0) {
                    CommandBot.sendMessage(source, "Can't edit line '" + mcmd[0] + "'.", chan);
                    return false;
                }
                Banner.data.Messages[mcmd[0] -1] = commandData.substring(commandData.indexOf(":") + 1);
                Banner.update();
                CommandBot.sendAll(source, "Banner Line " + mcmd[0] + " edited by " + db.playerToString(source) + ".", -1);
                return true;
            }
        },

        "spam" : {
            param :  ["target (optional. spams all by default)"],
            run : function (source, chan, command, commandData, mcmd) {

                var spamcolors = ["#F01010", "#B01010", "#901010", "#701010", "#501010", "#105010", "#107010", "#109010", "#10B010", "#10F010", "#10D010", "#10B010", "#107010", "#105010", "#101050", "#101070", "#1010B0", "#1010D0", "#1010F0"];
                if (sys.dbIp(commandData) == undefined) {
                    CommandBot.sendAll(source, db.playerToString(source) + " sent out Jirachi!</font>", chan);
                    for (var i = 0; i < spamcolors.length; i++) {
                        sys.sendHtmlAll("<font color=" + spamcolors[i] + "><timestamp/><font size=3>+<b><i>Jirachi use Iron Head! </b></i><font color=black>The server flinched!</font>", chan);
                    }
                    sys.sendHtmlAll("Jirachi ran out of PP!</font>", chan); 
                    return true;
                }
                CommandBot.sendAll(source, db.playerToString(source) + " sent out Jirachi!</font>", chan);
                for (var i = 0; i < spamcolors.length; i++) {
                    sys.sendHtmlMessage(target, "<font color=" + spamcolors[i] + "><timestamp/><font size=3>+<b><i>Jirachi use Iron Head! </b></i><font color=black>"+sys.name(target)+" flinched!</font>", chan); 
                }
                CommandBot.sendMessage(source, "You privately spammed " + sys.name(target), chan);
                sys.sendHtmlMessage(target, "Jirachi ran out of PP!</font>", chan); 
                return true;
            }
        },

        "epicfacepalm" : {
            run : function (source, chan, command, commandData, mcmd) {

                sys.sendHtmlAll("'. . . . . . . . . . . . . . . . . . . ________<br>. . . . . .. . . . . . . . . . . ,.-‘”. . . . . . . . . .``~.,<br>. . . . . . . .. . . . . .,.-”. . . . . . . . . . . . . . . . . .“-.,<br>. . . . .. . . . . . ..,/. . . . . . . . . . . . . . . . . . . . . . . ”:,<br>. . . . . . . .. .,?. . . . . . . . . . . . . . . . . . . . . . . . . . .\,<br>. . . . . . . . . /. . . . . . . . . . . . . . . . . . . . . . . . . . . . ,}<br>. . . . . . . . ./. . . . . . . . . . . . . . . . . . . . . . . . . . ,:`^`.}<br>. . . . . . . ./. . . . . . . . . . . . . . . . . . . . . . . . . ,:”. . . ./<br>. . . . . . .?. . . __. . . . . . . . . . . . . . . . . . . . :`. . . ./<br>. . . . . . . /__.(. . .“~-,_. . . . . . . . . . . . . . ,:`. . . .. ./<br>. . . . . . /(_. . ”~,_. . . ..“~,_. . . . . . . . . .,:`. . . . _/<br>. . . .. .{.._$;_. . .”=,_. . . .“-,_. . . ,.-~-,}, .~”; /. .. .}<br>. . .. . .((. . .*~_. . . .”=-._. . .“;,,./`. . /” . . . ./. .. ../<br>. . . .. . .\`~,. . ..“~.,. . . . . . . . . ..`. . .}. . . . . . ../<br>. . . . . .(. ..`=-,,. . . .`. . . . . . . . . . . ..(. . . ;_,,-”<br>. . . . . ../.`~,. . ..`-.. . . . . . . . . . . . . . ..\. . /\<br>. . . . . . \`~.*-,. . . . . . . . . . . . . . . . . ..|,./.....\,__<br>,,_. . . . . }.>-._\. . . . . . . . . . . . . . . . . .|. . . . . . ..`=~-,<br>. .. `=~-,_\_. . . `\,. . . . . . . . . . . . . . . . .\<br>. . . . . . . . . .`=~-,,.\,. . . . . . . . . . . . . . . .\<br>. . . . . . . . . . . . . . . . `:,, . . . . . . . . . . . . . `\. . . . . . ..__<br>. . . . . . . . . . . . . . . . . . .`=-,. . . . . . . . . .,%`>--==``<br>. . . . . . . . . . . . . . . . . . . . _\. . . . . ._,-%. . . ..`\'", chan);
                return true;
            }
        },

        "trollface" : {
            run : function (source, chan, command, commandData, mcmd) {

                sys.sendHtmlAll("░░░░░░▄▄▄▄▀▀▀▀▀▀▀▀▄▄▄▄▄▄░░░░░░░<br/>░░░░░█░░░░▒▒▒▒▒▒▒▒▒▒▒▒░░▀▀▄░░░░<br/>░░░░█░░░▒▒▒▒▒▒░░░░░░░░▒▒▒░░█░░░<br/>░░░█░░░░░░▄██▀▄▄░░░░░▄▄▄░░░░█░░<br/>░▄▀▒▄▄▄▒░█▀▀▀▀▄▄█░░░██▄▄█░░░░█░<br/>█░▒█▒▄░▀▄▄▄▀░░░░░░░░█░░░▒▒▒▒▒░█<br/>█░▒█░█▀▄▄░░░░░█▀░░░░▀▄░░▄▀▀▀▄▒█<br/>░█░▀▄░█▄░█▀▄▄░▀░▀▀░▄▄▀░░░░█░░█░<br/>░░█░░░▀▄▀█▄▄░█▀▀▀▄▄▄▄▀▀█▀██░█░░<br/>░░░█░░░░██░░▀█▄▄▄█▄▄█▄████░█░░░<br/>░░░░█░░░░▀▀▄░█░░░█░█▀██████░█░░<br/>░░░░░▀▄░░░░░▀▀▄▄▄█▄█▄█▄█▄▀░░█░░<br/>░░░░░░░▀▄▄░▒▒▒▒░░░░░░░░░░▒░░░█░<br/>░░░░░░░░░░▀▀▄▄░▒▒▒▒▒▒▒▒▒▒░░░░█░<br/>░░░░░░░░░░░░░░▀▄▄▄▄▄░░░░░░░░█░░", chan);
                return true;
            }
        },

        "changebanner" : {
            param : ["HTML"],
            run : function (source, chan, command, commandData, mcmd) {

                Banner.Dynamic = false;
                sys.changeAnnouncement(commandData);
                sys.sendAll("Banner was edited by " + db.playerToString(source));
                return true;
            }
        },

        "resetbanner" : {
            run : function (source, chan, command, commandData, mcmd) {

                Banner.Dynamic = true;
                Banner.update();
                sys.sendAll("Banner was set back to normal.");
                return true;
            }
        },

        "getjson" : {
            param : ["File Name (not restricted to JSON)"],
            run : function (source, chan, command, commandData, mcmd) {

                try {
                    sys.sendMessage(source, db.getFileContent(commandData), chan);
                    return true;
                } catch (e) {
                    sys.sendMessage(source, "Couldn't find " + commandData, chan);
                    return false;
                }
            }
        },

        "overridejson" : {
            param :  ["JSON File (will make the file if it doesn't exist)", "url to raw data (can fuck up the server)"],
            run : function (source, chan, command, commandData, mcmd) {

                var updateURL = commandData.substring(commandData.indexOf(':') + 1);
                var changeScript = function (resp) {
                    if (resp === "") {
                        return false;
                    }
                    try {
                        sys.writeToFile(mcmd[0], resp);
                        sys.changeScript(db.getFileContent('scripts.js'));
                    } catch (err) {
                        sys.sendMessage(source, err, chan);
                        sys.sendAll(err, watch);
                        print(err);
                    }
                };
                sys.webCall(updateURL, changeScript);
                return true;
            }
        },

        "init" : {
            run : function (source, chan, command, commandData, mcmd) {

                this.init();
                return true;
            }
        }
    };
    
    //  This is the bot that manages all of the commands
    CommandBot = {
        beforeChatMessage : function (source, msg, chan) {
            var command, commandData, mcmd,

            var pos = msg.indexOf(' ');
            if (pos != -1) {
                command = msg.substring(1, pos).toLowerCase();
                commandData = msg.substr(pos+1);
                while (-1 < commandData.indexOf("::")) {
                    commandData = commandData.replace("::", ":");
                }
                mcmd = commandData.split(":");
            } else {
                command = msg.substr(1).toLowerCase();
                commandData = undefined;
                mcmd = undefined;
            }
            target = sys.id(commandData);
            if (target != undefined && players[target] == undefined) {
                newPlayer(target);
            }
            
            players[source].lastCommand = parseInt(sys.time());
            
            //  Hide messages from watch... except like super important ones
            if (chan != elsewhere || -1 == ["kick", "ban", "rb", "mute", "delmember", "user"].indexOf(command)) {
                if (players[source].confined) {
                    this.sendAll(0, db.channelToString(chan) + "Confined Command -- " + db.playerToString(source, false, false, true) + " " + db.htmlEscape(msg),watch);
                } else {
                    this.sendAll(0, db.channelToString(chan) + " -- </font>" + db.playerToString(source) + " -- <b><font color=black>" + msg[0] + command + "</font></b> " + db.htmlEscape(commandData), watch);
                }
            }
            
            if (HiddenCommands[command] != undefined) {
                if (!HiddenCommands[command].run(source, chan, command, commandData, mcmd)) {
                    this.sendMessage(source, "There's a time and place for everything. But not now.", chan);
                }
                return;
            }
            if (UserCommands[command] != undefined) {
                if (UserCommands[command].run(source, chan, command, commandData, mcmd)) {
                } else {
                    this.sendMessage(source, "This isn't the time to use that!", chan);
                }
                return;
            }
            if (RPCommands[command] != undefined) {
                if (chan == party)  {
                    this.sendMessage(source, "Role-Playing commands are not allowed in the Party channel.", chan);
                    return;
                }
                if (RPCommands[command].run(source, chan, command, commandData, mcmd)) {
                } else {
                    this.sendMessage(source, "This isn't the time to use that!", chan);
                }
                return;
            }
            
            
            if (MemeCommands.run(source, chan, msg[0] == "%", command, commandData, mcmd)) {
                return;
            }
            
            if (0 < db.auth(source) || -1 < hash.get("megauser").indexOf(sys.name(source).toLowerCase())) {
                if (TourCommands[command] != undefined) {
                    if (!TourCommands[command].run(source, chan, command, commandData, mcmd)) {
                        this.sendMessage(source, "This isn't the time to use that!", chan);
                    }
                    return;
                }
            }
            
            if (0 < db.auth(source) || -1 < hash.get("partyhost").indexOf(sys.name(source).toLowerCase())) {
                if (PartyCommands[command] != undefined) {
                    if (!PartyCommands[command].run(source, chan, command, commandData, mcmd)) {
                        this.sendMessage(source, "This isn't the time to use that!", chan);
                    }
                    return;
                }
            }
            
            if (db.auth(source) < 1) {
                this.sendMessage(source, "There's a time and place for everything. But not now.", chan);
                return;
            }
            if (ModCommands[command] != undefined) {
                if (!ModCommands[command].run(source, chan, command, commandData, mcmd)) {
                    this.sendMessage(source, "This isn't the time to use that!", chan);
                }
                return;
            }
            if (db.auth(source) < 2) {
                this.sendMessage(source, "There's a time and place for everything. But not now.", chan);
                return;
            }
            if (AdminCommands[command] != undefined) {
                if (!AdminCommands[command].run(source, chan, command, commandData, mcmd)) {
                    this.sendMessage(source, "This isn't the time to use that!", chan);
                }
                return;
            }
            if (db.auth(source) < 3) {
                this.sendMessage(source, "There's a time and place for everything. But not now.", chan);
                return;
            }
            if (OwnerCommands[command] != undefined) {
                if (!OwnerCommands[command].run(source, chan, command, commandData, mcmd)) {
                    this.sendMessage(source, "This isn't the time to use that!", chan);
                }
                return;
            }
           this.sendMessage(source, "There's a time and place for everything. But not now.", chan);
        },
        
        sendMessage : function (target, msg, chan) {
            db.sendBotMessage(target, msg, chan, Config.CommandBot[0], Config.CommandBot[1]);
        },
        
        sendAll : function (source, msg, chan) {
            if (source != 0 && !isNaN(source) && players[source].confined) {
                this.sendMessage(source, msg, chan);
            } else {
                db.sendBotAll(msg, chan, Config.CommandBot[0], Config.CommandBot[1]);
            }
        }
    };
    
    Party = {
        //  These are the default username colors for players without their colors set
        randcolors : ['#5811b1','#399bcd','#0474bb','#f8760d','#a00c9e','#0d762b','#5f4c00','#9a4f6d','#d0990f','#1b1390','#028678','#0324b1'],
        
        //  Same rainbow as in welcomebot
        rainbowcolors : ["red", "orange", "#CCCC00", "green", "blue", "purple"],
    
        //  Called by script.beforeChatMessage().
        beforeChatMessage : function(source, message, chan) {
            if (chan != party) {
                return false;
            }
            
            if (message != db.htmlEscape(message)) {
                ChatBot.sendMessage(source, "HTML is banned in the party channel.", chan);
                return true;
            }
            
            var effsource = source;
            
            //  pewpewpew will randomize the names
            if (hash.get("party_pew")) {
                var players = sys.playersOfChannel(party);
                
                //  range can't be less than zero because the one speaking is always in the channel
                effsource = players[sys.rand(0, players.length)];
            }
            
            var name = sys.name(effsource) + ": ";
            
            //  Pig latin!
            if (hash.get("party_pig")) {
                var sgmay = message.toLowerCase().split(/\W|_ /);
                for (var i = 0; i < sgmay.length; i++) {
                    var word = sgmay[i], cons = "";
                    
                    var repeat = true;
                    while (repeat) {
                        if (word.length == 0) break;
                        var c = word.charAt(0);
                        switch (c) {
                            case 'a': case 'e': case 'i': case 'o': case 'u':
                                repeat = false;
                                break;
                                
                            default:
                                cons += c;
                                word = word.substring(1);
                                break;
                        }
                    }
                    sgmay[i] = word + cons + "ay";
                }
                message = sgmay.join(" ");
            }
            
            //  Reverse the text
            if (hash.get("party_reverse")) {
                var rname = "";
                var rmsg = "";
                for (var i = name.length - 1; i > -1; i--) {
                    rname += name[i];
                }
                for (var i = message.length - 1; i > -1; i--) {
                    rmsg += message[i];
                }
                
                name = rname;
                message = rmsg;
            }
            
            //  Colorizing will randomize color names
            if (hash.get("party_color")) {
                var cname = "";
                var cmsg = "";
                for (var i = 0; i < name.length; i++) {
                    cname += "<font color=" + this.randcolors[sys.rand(0, this.randcolors.length - 1)] + ">" + name[i] + "</font>";
                }
                for (var i = 0; i < message.length; i++) {
                    cmsg += "<font color=" + this.randcolors[sys.rand(0, this.randcolors.length - 1)] + ">" + message[i] + "</font>";
                }
                name = cname;
                message = cmsg;
            }
            
            //  Rainbow will rotate the colors in the name
            else if (hash.get("party_rainbow")) {
                var c = 0;
                var cname = "";
                var cmsg = "";
                for (var i = 0; i < name.length; i++, c++) {
                    cname += "<font color=" + this.rainbowcolors[c % this.rainbowcolors.length] + ">" + name[i] + "</font>";
                }
                for (var i = 0; i < message.length; i++, c++) {
                    cmsg += "<font color=" + this.rainbowcolors[c % this.rainbowcolors.length] + ">" + message[i] + "</font>";
                }
                name = cname;
                message = cmsg;
            }
            
            //  Message assembly is also different in reverse
            if (hash.get("party_reverse")) {
                if (db.auth(effsource) < 1) {
                    sys.sendHtmlAll("<font color=" + db.getColor(effsource) + "><timestamp/></font>" + message + "<font color=" + db.getColor(effsource) + "><b>" + name + "</b></font>", chan);
                }
                else {
                    sys.sendHtmlAll("<font color=" + db.getColor(effsource) + "><timestamp/></font> " + message + "<font color=" + db.getColor(effsource) + "><i><b>" + name + "</b></i>+</font>", chan);
                }
            }
            else {
                if (db.auth(effsource) < 1) {
                    sys.sendHtmlAll("<font color=" + db.getColor(effsource) + "><timestamp/><b>" + name + "</b></font>" + message, chan);
                }
                else {
                    sys.sendHtmlAll("<font color=" + db.getColor(effsource) + "><timestamp/> +<i><b>" + name + "</b></i></font>" + message, chan);
                }
            }
            return true;
        }
    };

    if (typeof (players) == 'undefined') players = new Array();
        
    newPlayer = function(source) {
        var time = parseInt(sys.time());
        players[source] = {};
        players[source].caps = 0;
        players[source].changeTeamTime = time;
        players[source].confined = false;
        players[source].id = source;
        players[source].impname = false;
        players[source].ip = sys.ip(source);
        players[source].floodCount = 0;
        players[source].lastCommand = time;
        players[source].lastchallenge = time;
        players[source].lastNameChange = time;
        players[source].oldmsg = '';
        players[source].oldmsg1 = '';
        players[source].oldname = sys.name(source);
        players[source].online = true;
        players[source].rpname = false;
        players[source].seed = 8000;
        players[source].showgoodbye = true;
        players[source].timeCount = time;
        players[source].timeLogged = time;
        var name = sys.name(source);
        if (players[source].seed == 13) {
            //  make the name all shiny
            var colors = ["red", "orange", "#CCCC00", "green", "blue", "purple"];
            var newname = "";
            for (var i = 0; i < sys.name(source).length; i++) {
                //  by coloring each letter one by one
                newname += "<font color=" + colors[i%6] + ">" + name[i]+"</font>";
            }
            name = newname;
        }
        else if (players[source].seed == 23) {
            //  make the name all infecty
            var colors = ["purple", "green"];
            var newname = "";
            for (var i = 0; i < sys.name(source).length; i++) {
                //  by coloring each letter one by one
                newname += "<font color=" + colors[i%2] + ">" + name[i]+"</font>";
            }
            name = newname;
        }
        else if (name == "[HH]Magnus") {
            name = "<font color='black'>[HH]</font><font color='red'>Magnus";
        }
        else if (name == "[HH]Messiah") {
            name = "<b><font color='#D0A9F5'>[</font><font color='#D0A9F5'>H</font><font color='#9F81F7'>H</font><font color='#8258FA'>]</font><font color='#642EFE'>M</font><font color='#4000FF'>e</font><font color='#3A01DF'>s</font><font color='#3104B4'>s</font><font color='#29088A'>i</font><font color='#210B61'>a</font><font color='#170B3B'>h</font></b>";
        }
        else if (name == "[HH]Frost1076") {
            name = "<font color='#007EA8'>[</font><font color='#0086B3'>H</font><font color='#008EBD'>H</font><font color='#0099CC'>]</font><font color='#00A1D6'>F</font><font color='#00ACE6'>r</font><font color='#00BFFF'>o</font><font color='#1AC6FF'>s</font><font color='#33CCFF'>t</font><font color='#4DD2FF'>1</font><font color='#66D9FF'>0</font><font color='#80DFFF'>7</font><font color='#99e6ff'>6</font>";
        }
        else if (name == "[HH]Jordan") {
            name = "<font color='#236A62'>[</font><font color='#549431'>H</font><font color='#236A62'>H</font><font color='#549431'>]</font><font color='#236A62'>J</font><font color='#549431'>o</font><font color='#236A62'>r</font><font color='#549431'>d</font><font color='#236A62'>a</font><font color='#549431'>n</font>";
        }
        else if (name == "[HH]Hallow Primordia") {
            name = "<font color='#ee9289'>[</font><font color='#e27a73'>H</font><font color='#d6635d'>H</font><font color='#ca4b48'>]</font><font color='#be3432'>H</font><font color='#b21c1c'>a</font><font color='#8e1616'>l</font><font color='#6b1111'>l</font><font color='#470b0b'>o</font><font color='#240606'>w</font> <font color='#05011b'>P</font><font color='#0a0236'>r</font><font color='#0e0350'>i</font><font color='#13046b'>m</font><font color='#250679'>o</font><font color='#370887'>r</font><font color='#490a94'>d</font><font color='#5b0ca2'>i</font><font color='#6d0eb0'>a</font>";
        }
        else if (name == "[HH]Saiomai") {
            name = '<font color="#ff0000">[</font><font color="#e8021d">H</font><font color="#d10439">H</font><font color="#bb0656">]</font><font color="#a40872">S</font><font color="#8d0a8f">a</font><font color="#71248c">i</font><font color="#553e89">o</font><font color="#3a5986">m</font><font color="#1e7383">a</font><font color="#028d80">i</font>';
        }

        //  Why is this commented out?
        players[source].htmlname = name;

    };
    
    (sys.existChannel(Config.MainChannelName)) ? main = sys.channelId(Config.MainChannelName) : main = sys.createChannel(Config.MainChannelName);
    (sys.existChannel(Config.AuthChannelName)) ? staffchan = sys.channelId(Config.AuthChannelName) : staffchan = sys.createChannel(Config.AuthChannelName);
    (sys.existChannel(Config.WatchChannelName)) ? watch = sys.channelId(Config.WatchChannelName) : watch = sys.createChannel(Config.WatchChannelName);
    (sys.existChannel(Config.PartyChannelName)) ? party = sys.channelId(Config.PartyChannelName) : party = sys.createChannel(Config.PartyChannelName);
    (sys.existChannel(Config.Elsewhere)) ? elsewhere = sys.channelId(Config.Elsewhere) : elsewhere = sys.createChannel(Config.Elsewhere);
    (sys.existChannel("The Mosh Pit")) ? clanchan = sys.channelId("The Mosh Pit") : clanchan = sys.createChannel("The Mosh Pit");
    (sys.existChannel("Role Playing")) ? rpchan = sys.channelId("Role Playing") : rpchan = sys.createChannel("Role Playing");
    for (var i = 0; i < Config.UserChannels.length; i++) {
        if (!sys.existChannel(Config.UserChannels[i])) {
            sys.createChannel(Config.UserChannels[i]);
        }
    }

    var mutefile = "Mute.json";
    function Mutes() {
        db.createFile(mutefile, "{}");
        this.muted = JSON.parse(db.getFileContent(mutefile));
    }
    Mutes.prototype.isMuted = function(ip) {
        if (typeof(this.muted[ip]) != "object") {
            return false;
        }
        if (this.muted[ip].time < parseInt(sys.time())) {
            this.unmute(ip);
            return false;
        }
        return true;
    };
    Mutes.prototype.mute = function(muter, ip, reason, time) {
        if (typeof(this.muted[ip]) == "object") {
            return false;
        }
        var expire = parseInt(sys.time()) + 60 * time;
        this.muted[ip] = {
            "muter" : muter,
            "reason" : reason,
            "time" : expire
        };
        this.save();
        return true;
    };
    Mutes.prototype.unmute = function(ip) {
        if (typeof(this.muted[ip]) != "object") {
            return false;
        }
        this.muted[ip] = 0;
        this.save();
        return true;
    };
    Mutes.prototype.save = function() {
        sys.writeToFile(mutefile, JSON.stringify(this.muted));
    };
    Mutes.prototype.muteMessage = function (source, chan) {
        var ip = sys.ip(source);
        ChatBot.sendMessage(source, "You are muted. (Reason:  " + this.muted[ip].reason + ". Duration: " + db.getTimeString(this.muted[ip].time - parseInt(sys.time())) + ")", chan);
    };
    Mutes.prototype.display = function (source, chan, command, commandData, mcmd) {
        sys.sendHtmlMessage(source, "<hr>", chan);
        ChatBot.sendMessage(source, "Mute List:", chan);
        var str = "<table width='100%'><tr><th width=20%>IP</th><th width=20%>Muter</th><th width=30%>Reason</th><th width=30%>Time</th></tr>";
        for (var ip in this.muted) {
            if (this.muted[ip] != 0) {
                if (this.muted[ip].time < parseInt(sys.time())) {
                    this.unmute(ip);
                } else {
                    str += "<tr><td>" + ip + "</td><td>" + this.muted[ip].muter + "</td><td>" + this.muted[ip].reason + "</td><td>" + db.getTimeString(this.muted[ip].time - parseInt(sys.time())) + "</tr>";
                }
            }
        }
        sys.sendHtmlMessage(source, str + "</table>", chan);
        sys.sendHtmlMessage(source, "<hr>", chan);
    };
    mutes = new Mutes();
      
    //Rangeban Code
    var banFile = "RangeBan.json";
    function RangeBans() {
        db.createFile(banFile, "[]");
        this.list = JSON.parse(db.getFileContent(banFile));
    };

    RangeBans.prototype.isBanned = function(ip) {
        var val = db.iptoint(ip);
        val -= (val % 65536);
        return -1 < this.list.indexOf(val);
    };
    RangeBans.prototype.ban = function(ip) {
        var val = db.iptoint(ip);
        if (val < 65536) {
            return false;
        }
        val -= (val % 65536);
        if (-1 < this.list.indexOf(val)) {
            return false; 
        }
        this.list.push(val);
        this.list.sort();
        this.save();
        return true;
    };
    RangeBans.prototype.unban = function(ip) {
        var val = db.iptoint(ip);
        var i = this.list.indexOf(val - (val % 65536));
        if (i == -1) {
            return false;
        }
        this.list.splice(i, 1);
        this.save();
        return true;
    };
    RangeBans.prototype.save = function() {
        sys.writeToFile(banFile, JSON.stringify(this.list));
    };
    RangeBans.prototype.display = function (source, chan, command, commandData, mcmd){
        sys.sendHtmlMessage(source, "<hr>", main);
        if(this.list.length == 0) {
          sys.sendHtmlMessage(source,"<timestamp/>No Range Bans yet!", main);
        }
        else {
            Guard.sendMessage(source,"Range Ban List:", main);
            var str = "";
            for (var i = 0; i < this.list.length; i++) {
                str += db.inttoip(this.list[i]) + " ";
            }
            sys.sendMessage(source, str, main);
        }
        sys.sendHtmlMessage(source, "<hr>", main);
    };
    rangebans = new RangeBans();

    var ipbanfile = "ipbans.json";
    function IPBans() {
        db.createFile(ipbanfile, "[]");
        this.list = JSON.parse(db.getFileContent(ipbanfile));
    }
    IPBans.prototype.save = function () {
        sys.writeToFile(ipbanfile, JSON.stringify(this.list));
    }
    IPBans.prototype.isBanned = function (ip) {
        return -1 < this.list.indexOf(db.iptoint(ip));
    }
    IPBans.prototype.ban = function (ip) {
        var val = db.iptoint(ip), i = this.list.indexOf(val);
        if (i == -1) {
            this.list.push(val);
            this.list.sort();
            this.save();
            return true;
        }
        return false;
    }
    IPBans.prototype.unban = function (ip) {
        var val = db.iptoint(ip), i = this.list.indexOf(val);
        if (i == -1) {
            return false;
        }
        this.list.splice(i, 1);
        this.save();
        return true;
    }
    IPBans.prototype.display = function (source) {
        sys.sendHtmlMessage(source, "<hr>", main);
        if (this.list.length == 0) {
            Guard.sendMessage(source, "No IP bans yet!", main);
        }
        else {
            Guard.sendMessage(source, "IP Ban list:", main);
            var str = "";
            for (var i = 0; i < this.list.length; i++) {
                str += db.inttoip(this.list[i]) + " ";
            }
            sys.sendHtmlMessage(source, str, main);
        }
        sys.sendHtmlMessage(source, "<hr>", main);
    }
    ipbans = new IPBans();

    var memberFile = "Members.json";
    function Clan() {
        db.createFile(memberFile, "[]");
        this.members = JSON.parse(db.getFileContent(memberFile));
    }
    Clan.prototype.tagToString = function () {
        return "" + Config.SurroundTag.replace("%%", Config.ClanTag);
    };
    Clan.prototype.indexInClan = function (name) {
        if (0 < sys.dbAuth(name) || 0 < db.auth(sys.id(name))) {
            return true;
        }
        name = db.escapeTagName(name, false).toLowerCase();
        if (name.charAt(0) == ' ') {
            name = name.substring(1, name.length);
        }
        return this.members.indexOf(name);
    };
    Clan.prototype.addMember = function (source, name) {
        for (var i = 0; i < name.length; i++) {
            //because too lazy to look up unicode
            if (name[i] != ' '
            && (name[i] < 'a' && name[i] < 'A' && name[i] < '0'
            ||  name[i] > 'z' && name[i] > 'Z' && name[i] > '9')
            ) {
                sys.sendMessage(source, "~~Server~~: Only alphanumeric names can be clan members.", main);
                return;
            }
        }
        var x = this.indexInClan(name);
        sys.sendMessage(source, "->Debugger: This user is index " + x, main);
        if (-1 < x) {
            sys.sendMessage(source, "~~Server~~:" + name + " is already in the member database.", main);
            return;
        }
        this.members.push(db.escapeTagName(name).toLowerCase());
        sys.sendAll("~~Server~~: " + name + " was added to " + this.tagToString() + "!", main);
        sys.writeToFile(memberFile, JSON.stringify(this.members));
    };
    Clan.prototype.removeMember = function (source, name) {
        name = db.escapeTagName(name, false).toLowerCase();
        var x = this.indexInClan(name);
        if (-1 == x) {
            sys.sendMessage(source, "~~Server~~:" + name + " isn't in the member database.", main);
            return;
        } else {
            this.members.splice(x, 1);
        }
        sys.sendAll("~~Server~~: " + name + " was removed from the database.", main);
        sys.writeToFile(memberFile, JSON.stringify(this.members));
    };
    Clan.prototype.showAll = function (source, chan) {
        this.members = JSON.parse(db.getFileContent(memberFile));
        if (this.members[0] == undefined) {
            sys.sendMessage(source, "~~Server~~: No members!");
            return;
        }
        this.members = this.members.sort();
        sys.sendMessage(source, "~~Server~~: The " + this.members.length + " members are:", chan);
        sys.sendMessage(source, this.members.join(", "), chan);
        sys.writeToFile(memberFile, JSON.stringify(this.members));
    };
    Clan.prototype.exportMembers = function (source, chan) {
        sys.sendMessage(source, JSON.stringify(this.members), chan);
    };
    clan = new Clan();
    
    //db.createFile("awards.json", "{}");
    
    Pictures = JSON.parse(db.getFileContent("pictures.json"));
    
    
    var jug = {};
    var juggerFile = "Juggernaut.json";
    function Juggernaut() {
        db.createFile(juggerFile,"{}");
        if (db.getFileContent(juggerFile).length < 3) {
            jug.name = Config.DefaultJuggernaut;
            jug.ips = ["192.168."];
            jug.time = sys.time();
            this.save();
        } else {
            jug = JSON.parse(db.getFileContent(juggerFile));
        }
    };
    
    Juggernaut.prototype.sendMessage = function (target, msg, chan) {
        db.sendBotMessage(target, msg, chan, Config.Juggernaut[0], Config.Juggernaut[1]);
    };
    Juggernaut.prototype.sendAll = function (msg, chan) {
        db.sendBotAll(msg, chan, Config.Juggernaut[0], Config.Juggernaut[1]);
    };
    Juggernaut.prototype.lastWon = function(){
        return parseInt(sys.time()) - parseInt(jug.time);
    };
    Juggernaut.prototype.isJuggernaut = function (id) {
        return (sys.name(id).toLowerCase() == jug.name.toLowerCase());
    };
    Juggernaut.prototype.jWonAgainst = function (id) {
        jug.time = parseInt(sys.time());
        var sep = sys.ip(id).split('.');
        var ip = sep[0] + '.' + sep[1] + '.';
        
        //  Decide if the person was already battled.
        for (var i = 1; i < jug.ips.length; i++) {
            if (jug.ips[i] == ip) {
                this.sendMessage(id, "You lost to " + jug.name + " before so no points were awarded.", main);
                this.sendMessage(sys.id(jug.name), "You already won against " + sys.name(id) + " so no points were awarded.", main);
                return;
            }
        }
        jug.ips.push(ip);
        var score = this.getScore();
        
        switch (score) {
            case 5: {
                this.sendAll("Winning streak!", main);
                break;
            }
            case 10: {
                this.sendAll(Pictures["planktonwins"], main);
                break;
            }
            case 15: {
                this.sendAll("Unstoppable!", main);
                break;
            }
            case 20: {
                this.sendAll("Hax God!", main);
                break;
            }
            case 30: {
                this.sendAll(this.getName() + "'s base are belonged to us", main);
                break;
            }
            case 25: {
                this.sendAll(Pictures["completed"], main);
                break;
            }
            default: {
                if (score > 29 && score % 5 == 0) {
                    this.sendAll("Pokemon Master!", main);
                } else {
                    this.sendAll(db.playerToString(sys.id(this.getName())) + " won against " + db.playerToString(id) + " as the Juggernaut and now has a score of " + score, main);
                }
            }
        }
        this.save();
        Banner.update();
    };
    Juggernaut.prototype.getName = function (){
        return jug.name;
    };
    Juggernaut.prototype.getScore = function (){
        return jug.ips.length - 1;
    };
    Juggernaut.prototype.newJuggernaut = function (name) {
        jug.name = name;
        jug.time = parseInt(sys.time());
        var sep = sys.dbIp(name).split('.');
        var str = sep[0] + '.' + sep[1] + '.';
        jug.ips = [str];
        this.save();
        this.sendAll(name + " is the new Juggernaut!", main);
        Banner.update();
    };
    Juggernaut.prototype.save = function () {
        sys.writeToFile(juggerFile, JSON.stringify(jug));
    };
    juggernaut = new Juggernaut();

    
    var AssassinFile = "Assassin.json";
    function Assassin() {
        db.createFile(AssassinFile, "{}");
        this.data = JSON.parse(db.getFileContent(AssassinFile));
        if (this.data.players == undefined) {
            this.clear();
        }
    }
    Assassin.prototype.sendMessage = function (target, msg, chan) {
        db.sendBotMessage(target, msg, chan, Config.AssassinBot[0], Config.AssassinBot[1]);
    };
    
    Assassin.prototype.sendAll = function (msg, chan) {
        db.sendBotAll(msg, chan, Config.AssassinBot[0], Config.AssassinBot[1]);
    };
    
    Assassin.prototype.clear = function () {
        this.data.players = [];
        this.data.allplayers = [];
        this.data.scores = [];
        this.data.mode = 0;
        this.data.numplayers = 0;
        this.save();
    };
    
    Assassin.prototype.showAll = function (source, chan, command, commandData, mcmd) {
        sys.sendHtmlMessage(source, "<hr>", chan);
        this.sendMessage(source, "All players that started this match are:", chan);
        sys.sendMessage(source, this.data.allplayers.join(", "), chan);
        sys.sendMessage(source, "", chan);
        this.sendMessage(source, "There are " + this.data.players.length + " players remaining.", chan);
        var i = this.data.allplayers.indexOf(sys.name(source));
        //  If the person is in the game
        if (-1 < i) {
            
            var j = this.data.players.indexOf(sys.name(source));
            
            //  If the person hasn't died
            if (j != -1) {
                sys.sendMessage(source, "", chan);
                this.sendMessage(source, "Your score is " + this.data.scores[i] + ".", chan);
                this.sendMessage(source, "Your target is " + this.getTarget(j) + ".", chan);
            }
            
            //  The player has died
            else {
                sys.sendMessage(source, "", chan);
                this.sendMessage(source, "Your score is " + this.data.scores[i] + ".", chan);
                this.sendMessage(source, "You are dead!.", chan);
            }
        }
        sys.sendHtmlMessage(source, "<hr>", chan);
    };
    
    Assassin.prototype.getResults = function (source, chan, command, commandData, mcmd) {
        sys.sendHtmlMessage(source, "<hr>", chan);
        if (this.data.allplayers.length == 0) {
            this.sendMessage(source, "There are no results to display.", chan);
            sys.sendHtmlMessage(source, "<hr>", chan);
            return;
        }
        this.sendMessage(source, "The results of the most recent game are:", chan);
        var msg = "<table><tr><th>Player</th><th>Score</th>";
        var winners = [],
            winning = this.data.scores[0];
        
        //  Show all player info
        for (var i = 0; i < this.data.allplayers.length; i++) {
            
            //  Find the winner
            if (winning < this.data.scores[i]) {
                winners = [this.data.allplayers[i]];
                winning = this.data.scores[i];
            }
            else if (winning == this.data.scores[i]) {
                winners.push(this.data.allplayers[i]);
            }
            
            
            msg += "<tr><td>";
            
            //  The player is alive - green font
            if (-1 < this.data.players.indexOf(this.data.allplayers[i])) {
                msg += "<font color=green>" + this.data.allplayers[i] + "</font>";
            }
            
            //  The player is dead - red font
            else {
                msg += "<font color=red>" + this.data.allplayers[i] + "</font>";
            }
            
            //  Show the score
            msg += "</td><td>" + this.data.scores[i] + "</td></tr>";
        }
        
        
        msg += "</table>";
        sys.sendHtmlMessage(source, msg, chan);
        if (winners.length == 1) {
            this.sendMessage(source, "The winner is " + winners[0] + " with a score of " + winning + ".", chan);
        }
        else {
            this.sendMessage(source, "The winners are " + winners.join(", ") + " with a score of " + winning + ".", chan);
        }
        sys.sendMessage(source, "", chan);
        sys.sendHtmlMessage(source, "<hr>", chan);
    }
    
    Assassin.prototype.showResults = function(chan)  {
        sys.sendHtmlAll("<hr>", chan);
        this.sendAll("The results of the most recent game are:", chan);
        var msg = "<table><tr><th>Player</th><th>Score</th>";
        var winners = [],
            winning = this.data.scores[0];
        
        //  Show all player info
        for (var i = 0; i < this.data.allplayers.length; i++) {
            
            //  Find the winner
            if (winning < this.data.scores[i]) {
                winners = [this.data.allplayers[i]];
                winning = this.data.scores[i];
            }
            else if (winning == this.data.scores[i]) {
                winners.push(this.data.allplayers[i]);
            }
            
            
            msg += "<tr><td>";
            
            //  The player is alive - green font
            if (-1 < this.data.players.indexOf(this.data.allplayers[i])) {
                msg += "<font color=green>" + this.data.allplayers[i] + "</font>";
            }
            
            //  The player is dead - red font
            else {
                msg += "<font color=red>" + this.data.allplayers[i] + "</font>";
            }
            
            //  Show the score
            msg += "</td><td>" + this.data.scores[i] + "</td></tr>";
        }
        
        
        msg += "</table>";
        sys.sendHtmlAll(msg, chan);
        if (winners.length == 1) {
            this.sendAll("The winner is " + winners[0] + " with a score of " + winning + ".", chan);
        }
        else {
            this.sendAll("The winners are " + winners.join(", ") + " with a score of " + winning + ".", chan);
        }
        sys.sendAll("", chan);
        sys.sendHtmlAll("<hr>", chan);
    };
    
    Assassin.prototype.matchOver = function(winner, loser) {
        
        //  Get the ids and enforce they are still in the game
        var w = this.data.players.indexOf(winner);
        if (-1 == w) {
            return;
        }
        var l = this.data.players.indexOf(loser);
        if (-1 == l) {
            return;
        }
        
        var wid = sys.id(winner), lid = sys.id(loser);
        
        //  Check again that they are online- don't let lame DC's change the game
        if (lid == undefined) {
            this.sendMessage(wid, "The game was dropped due to player disconnection. Try again when they come online.", main);
            return;
        }
        
        //  DQ the loser
        this.data.players.splice(l, 1);
        this.sendMessage(lid, "You were killed by your " + (w < l ? "assassin" : "target") + " and are out of the game!", main);
        
        //  Add the score
        this.data.scores[this.data.allplayers.indexOf(winner)]++;
        
        this.save();
        
        //  Game is over
        if (this.data.players.length == 1) {
            this.showResults(main);
            this.data.mode = 0;
            
            return;
        }
        
        //  the winner was the assassin
        if (w < l) {
            this.sendMessage(wid, "You killed your target and earned 1 point!", main);
            this.sendMessage(wid, "Your next target is " + this.getTarget(w) + ".", main);
        }
        
        //  The winner was the target
        else {
            this.sendMessage(wid, "You killed your assassin and earned 1 point!", main);
            
            //  The person whose target was killed should get alerted
            
            //  The person who gets alerted is the one before the winner
            var x = this.data.players.indexOf(winner) - 1;
            if (x < 0) {
                x = this.data.players.length - 1;
            }
            var xid = sys.id(this.data.players[x]);
            if (xid != undefined) {
                this.sendMessage(xid, "Your target was killed! Your new target is " + winner + ".", chan);
            }
        }
    };
        
    Assassin.prototype.getTarget = function (id) {
        //  For some dumbass reason modulo wouldn't work
        var tar = id + 1;
        if (this.data.players.length == tar) {
            tar = 0;
        }
        return this.data.players[tar];
    };
    
    Assassin.prototype.getAssassin = function (id) {
        var src = id - 1;
        if (src == -1) {
            src = this.data.players.length - 1;
        }
        return this.data.players[src];
    }
    
    Assassin.prototype.register = function (name) {
        if (this.data.mode != 1) {
            this.sendMessage(sys.id(name), "There is no assassin game in its sign-up phase.", main);
            return false;
        }
        
        if (this.data.allplayers.indexOf(name) != -1) {
            this.sendMessage(sys.id(name), "You are already in this round.", main);
            return false;
        }
        
        this.data.allplayers.push(name);
        this.data.scores.push(0);
        var num = this.data.numplayers - this.data.allplayers.length;
        this.sendAll(name + " joined Assassin! " + num + " spot" + (num == 1 ? "" : "s") + " left! Join with !assassin join.", main);
        
        if (this.data.allplayers.length == this.data.numplayers) {
            this.startGame();
        }
        else {
            this.save();
        }
        return true;
    };
    
    Assassin.prototype.leave = function (name) {
        if (this.data.mode == 0) {
            this.sendMessage(sys.id(name), "You can't leave since there is no game.", main);
            return false;
        }
        
        //  Unsignup
        if (this.data.mode == 1) {
            var i = this.data.allplayers.indexOf(name);
            if (i == -1) {
                this.sendMessage(sys.id(name), "You can't leave since you haven't joined!", main);
                return false;
            }
            this.data.allplayers.splice(i, 1);
            this.data.scores.splice(0, 1);
            
            var num = this.data.numplayers - this.data.allplayers.length;
            this.sendAll(name + " has left the game! " + num + " spot" + (num == 1 ? "" : "s") + " left! Join with !assassin join.", main);
        }
        
        else {            
            
            var l = this.data.players.indexOf(name);
            if (-1 == l) {
                return;
            }
            
            var w = l - 1;
            if (w == -1) w = this.data.players.length - 1;
            
            var wid = sys.id(this.data.players[w]);
            
            //  DQ the loser
            this.data.players.splice(l, 1);
            this.sendAll(name + " forfeited Assassin and is out of the game!", main);
            
            this.save();
            
            //  Game is over
            if (this.data.players.length == 1) {
                this.showResults(main);
                this.data.mode = 0;
            }
            else {
                this.sendMessage(wid, "Your target forfeited. Your next target is " + this.getTarget(w) + ".", main);
            }
        }
        return true;
    }
    
    Assassin.prototype.startGame = function () {
        sys.sendHtmlAll("<hr>", main);
        sys.sendHtmlAll('<b><font style="color: ' + Config.AssassinBot[1] + '">A new game of Assassin has begun!</font></b>', main);
        sys.sendAll("", main);

        this.data.mode = 2;
        this.sendAll("The players for this round are (in no particular order):", main);
        var msg = [];
        
        //  Copy the players list to begin the shuffle
        this.data.players = [];
        for (var i = 0; i < this.data.allplayers.length; i++) {
        
            //  Copy the player
            this.data.players.push(this.data.allplayers[i]);
            
            //  Add the player to the display list
            var id = sys.id(this.data.allplayers[i]);
            
            if (id != undefined) {
                msg.push(db.playerToString(id, 0, 0, 0));
            }
            else {
                msg.push(this.data.allplayers[i]);
            }
        }
        
        sys.sendHtmlAll(msg.join(", "), main);
        
        
        //  Shuffle the list
        for (var j, x, i = this.data.players.length;
            i;
            j = Math.floor(Math.random() * i),
            x = this.data.players[--i],
            this.data.players[i] = this.data.players[j],
            this.data.players[j] = x);
        
        //  Now tell everyone their targets
        for (var i = 0; i < this.data.players.length; i++) {
            var id = sys.id(this.data.players[i]);
            if (id != undefined) {
                this.sendMessage(id, "Your first target is " + this.getTarget(i) + "!", main);
            }
        }
        
        sys.sendHtmlAll("<hr>", main);
        
        this.save();
    };
    
    Assassin.prototype.save = function () {
        sys.writeToFile(AssassinFile,JSON.stringify(this.data));
    };

    function AuthLogs () {
        db.createFile("authlogs.json", "[]");
        this.logs = JSON.parse(sys.getFileContent("authlogs.json"));
    }

    AuthLogs.prototype.log = function(source, command, target, reason) {
        this.logs.push([source, command, target, reason]);
        this.save();
    }

    AuthLogs.prototype.display = function(source, chan, num) {
        var table = "<br><table><tr><th style='padding-left:5px;'>User</th><th style='padding-left:5px;'>Command</th><th style='padding-left:5px;'>Target</th><th style='padding-left:5px;'>Reason</th></tr>";
        for (var i = this.logs.length - 1; -1 < i && -1 < num; i--) {
            table += "<tr><td>" + this.logs[i][0] + "</td><td>" + this.logs[i][1] + "</td><td>" + this.logs[i][2] + "</td><td>" + this.logs[i][3] + "</td></tr>";
            num--;
        }
        sys.sendHtmlMessage(source, table + "</table><br>", chan);
    }

    AuthLogs.prototype.save = function() {
        sys.writeToFile("authlogs.json", JSON.stringify(this.logs));
    }

    logs = new AuthLogs();
    
    assassin = new Assassin();
    
    if (typeof (tourmode) == 'undefined') tourmode = false;
    
    //Tournament Code
    cmp = function (a, b) {
        return (a.toLowerCase() == b.toLowerCase());
    };
    tourSpots = function () {
        return tournumber - tourmembers.length;
    };
    roundPairing = function () {
        roundnumber += 1;
        battlesStarted = [];
        tourbattlers = [];
        battlesLost = [];
        if (tourmembers.length == 1) {
            var chans = [0];
            sys.sendHtmlAll("<hr>", main);
            sys.sendHtmlAll("<center><font style=' color:#FF00CC'><b>And the winner is:</b></font><br><font color=" + db.getColor(sys.id(tourplayers[tourmembers[0]])) + ">" + tourplayers[tourmembers[0]] + "</font><br>Congratulations, " + tourplayers[tourmembers[0]] + "! You won "+prize+"!</center>", main);
            sys.sendHtmlAll("<hr>", main);
            tourmode = 0;
            return;
        }
        var finals = (tourmembers.length == 2);
        sys.sendHtmlAll("<hr>", main);
        if (!finals) {
            sys.sendHtmlAll('<center><b><font style="color: #FF00CC">Round '+roundnumber+' of '+tourtier+' Tournament</font></b></center>', main);
        } else {
            sys.sendHtmlAll('<center><b><font style="color: #FF00CC">FINALS OF '+tourtier+' TOURNAMENT</font></b></center>', main);
        }
        var i = 0;
        while (tourmembers.length >= 2) {
            i += 1;
            var x1 = sys.rand(0, tourmembers.length);
            tourbattlers.push(tourmembers[x1]);
            var name1 = tourplayers[tourmembers[x1]];
            tourmembers.splice(x1,1);
            x1 = sys.rand(0, tourmembers.length);
            tourbattlers.push(tourmembers[x1]);
            var name2 = tourplayers[tourmembers[x1]];
            tourmembers.splice(x1,1);
            battlesStarted.push(false);
            sys.sendHtmlAll("<center><font style='color: " + db.getColor(sys.id(name1)) + "'><b>"+name1+"</b></font> vs <font color=" + db.getColor(sys.id(name2)) + "><b>"+name2+"</b></font></center></b>", main);
        }
        if (tourmembers.length > 0) {
            TourBot.sendAll("<b><font style='color: " + db.getColor(sys.id(tourplayers[tourmembers[0]]))+"'>" + tourplayers[tourmembers[0]] + "</font></b> was randomly selected to move on to the next round.", main);
        }
        sys.sendHtmlAll ("<hr>", main);
    };
    tourOpponent = function (nam) {
        var name = nam.toLowerCase();
        var x = tourbattlers.indexOf(name);
        if (x != -1) {
            if (x % 2 == 0) return tourbattlers[x+1];
            return tourbattlers[x-1];
        }
        return "";
    };
    tourBattleEnd = function (source,  target) {
        if (!areOpponentsForTourBattle2(source, target) || !ongoingTourneyBattle(source)) {
            return;
        }
        battlesLost.push(source);
        battlesLost.push(target);
        var sourceL = source.toLowerCase();
        var targetL = target.toLowerCase();
        battlesStarted.splice(Math.floor(tourbattlers.indexOf(sourceL)/2), 1);
        tourbattlers.splice(tourbattlers.indexOf(sourceL), 1);
        tourbattlers.splice(tourbattlers.indexOf(targetL), 1);
        tourmembers.push(sourceL);
        delete tourplayers[targetL];
        if (tourbattlers.length < 2) {
            roundPairing();
            return;
        }
        sys.sendHtmlAll("<hr>", main);
        sys.sendHtmlAll("<b><center><font style='color: " + db.getColor(sys.id(source)) + "'>" +source+"</font> won the battle and advanced to the next round!", main);
        sys.sendHtmlAll("<b><center><font style='color: " + db.getColor(sys.id(target)) + "'>" +target+"</font> lost the battle and is out of the tournament", main);
        if (!tourbattlers.length == 0) {
            sys.sendHtmlAll("<b><center>" + tourbattlers.length/2 + " battle"+((tourbattlers.length == 1)?"":"s")+" remaining", main);
        }
        sys.sendHtmlAll("<hr>", main);
    };
    areOpponentsForTourBattle = function(source,  target) {
        return isInTourney(sys.name(source).toLowerCase()) 
            && isInTourney(sys.name(target).toLowerCase())
            && tourOpponent(sys.name(source)) == sys.name(target).toLowerCase();
    };
    areOpponentsForTourBattle2 = function(source,  target) {
        return isInTourney(source.toLowerCase())
            && isInTourney(target.toLowerCase())
            && tourOpponent(source) == target.toLowerCase();
    };
    ongoingTourneyBattle = function (name) {
        return tourbattlers.indexOf(name.toLowerCase()) != -1
            && battlesStarted[Math.floor(tourbattlers.indexOf(name.toLowerCase())/2)] == true;
    };
    isInTourney = function (name) {
        if (tourmode == 0) {
          return false;
        }
        return (name in tourplayers);
    };
    
    //just leave this in for later when party comes back
    var zolarColors = ["blue", "darkblue", "green", "darkgreen", "red", "darkred", "orange", "skyblue", "purple", "violet", "black", "lightsteelblue", "navy", "burlywood", "DarkSlateGrey", "darkviolet", "Gold", "Lawngreen", "silver"];
    
    
    Banner.update();
    Banner.setdesc();
    failed = false;
},

serverStartUp : function(){
    this.init();
    uptime = sys.time();
    var repeat = sys.rand(1, sys.rand(2, 10));
    var index = 0;
    for (var i = 0; i < repeat; i++) {
        if (sys.rand(0, 3) == 2) {
            break;
        }
    }
},

serverShutDown : function (){},

step : function (){
    if (failed) return;
    Tumbleweed.step();
    Banner.step();
},

beforeIPConnected : function (ip) {
    if (ipbans.isBanned(ip)) {
        sys.sendAll("IP-banned IP " + ip + " was rejected.", watch);
        sys.stopEvent();
        return;
    }
    if (rangebans.isBanned(ip)) {
        sys.sendAll("Rangebanned IP " + ip + " was banned.", watch);
        ipbans.ban(ip);
        sys.stopEvent();
        return;
    }
},

//Log on/off
beforeLogIn : function (source) {
    if (-1 < sys.name(source).indexOf(clan.tagToString())
    && clan.indexInClan(sys.name(source)) == -1) {
        sys.sendMessage(source, "~~Server~~: Your name wasn't found on the members list. This could be our error- a reminder will do fine. Otherwise, you must try out to join the clan.");
        sys.sendAll(sys.name(source) + " was rejected for not being in the clan.", watch);
        sys.stopEvent();
        return;
    }
    if (hash.get("lockdown") && -1 == sys.name(source).indexOf(clan.tagToString())) {
        sys.sendAll("~~Server~~: " + sys.name(source) + " was rejected for not being in the clan.", watch);
        sys.stopEvent();
        return;
    }
},

afterLogIn : function (source) {
    //  No TI until after login
    if (sys.info(source) == "Death to all who face me") {
        sys.kick(source);
        return;
    }
/*    if (Config["BadCharacters"].test(sys.info(source))) {
//        sys.ban(sys.ip(source));
        sys.kick(source);
        return;
    }*/
    if (players[source] == undefined) {
        newPlayer(source);
    }
    
    var name = sys.name(source);
    
    
    players[source].showgoodbye = false;
    if (db.auth(source) < 1 && db.nameIsInappropriate(name)) {
        sys.sendMessage(source, "~~Server~~: That name is not acceptable.");
        sys.kick(source);
        return;
    }
    players[source].showgoodbye = true;
    
    WelcomeBot.afterLogIn(source);
    for (var i = 0; i < sys.teamCount(source); i++) {
        TierBot.fixTeam(source, i);
    }
    if (tourmode == 1) {
        sys.sendHtmlMessage(source,"<hr>", main);
        TourBot.sendMessage(source, "A " + tourtier + " tournament is in its signup phase.", main);
        CommandBot.sendMessage(source, "Type !join to enter or !tourrules to see this server's Tournament rules.", main);
        TourBot.sendMessage(source, tourSpots() + " spots remaining!", main);
        TierBot.sendMessage(source, "Prize: " + prize, main);
        sys.sendHtmlMessage(source,"<hr>", main);
    }
    
    //  Only update banner if the person is on the banner
    for (var i = 0; i < Config.League.length; i++){
        if (Config.League[i][0] == name) {
            Banner.update();
        }
    }
    
    if (mutes.isMuted(sys.ip(source))) {
        sys.sendMessage(source, "", main);
        ChatBot.sendMessage(source, "You are muted. Think about your life.", main);
        sys.sendMessage(source, "", main);
        sys.sendAll("Muted player " + name + " entered.", watch);
    }
    if (assassin.data.mode == 2) {
        //  Check to see if this player is still playing Assassin
        var i = assassin.data.players.indexOf(name);
        if (-1 < i) {
            
            //  Tell the person about their target
            var target = assassin.getTarget(i);
            
            //  The target is offline
            if (sys.id(target) == undefined) {
                assassin.sendMessage(source, "Your target, " + target + ", is not online.", main);
            }
            
            //  The target is online
            else {
                assassin.sendMessage(source, "Your target, " + target + ", is online.", main);
            }
            
            //  Alert the killer
            var killer = assassin.data.players[(i + assassin.data.players.length - 1) % assassin.data.players.length];
            var id = sys.id(killer);
            
            //  Only tell the killer of they're online
            if (id != undefined) {
                assassin.sendMessage(id, name + " is your target!", main);
            }
        }
    }
    
    if (0 < db.auth(source)) {
        try {
            var msg = hash.get("authnote");
            if (msg.length != 0) {
                sys.sendMessage(source, "~~Server~~: Auth note: " + msg, chan);
            }
        }
        catch (e) {
            hash.set("authnote", "Invalid auth note registered. Please place a new one.");
            sys.sendMessage(source, "~~Server~~: Auth note: " + hash.get("authnote"));
        }
    }
    
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
},

beforeLogOut : function (source) {
    if (players[source] == undefined) {
        newPlayer(source);
    }
    if (players[source].showgoodbye) {
        WelcomeBot.afterLogOut(source);
    }
    players[source].online = false;
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
},

beforeChannelJoin : function (source, chan){
    //  permit all user channels
    if (-1 < Config.UserChannels.indexOf(sys.channel(chan))) {
        return;
    }
    switch (chan) {
        //  auth only
        case staffchan: case watch: {
            if (db.auth(source) < 1 && -1 == hash.get("allowstaffchan").indexOf(sys.name(source).toLowerCase())) {
                Guard.sendMessage(source, "Only Auth are allowed in that channel.", main);
                sys.stopEvent();
                return;
            }
            break;
        }
        case clanchan: {
            if (-1 == sys.name(source).indexOf(clan.tagToString())) {
                sys.sendMessage(source, "~~Server~~: This channel only permits " + clan.tagToString() + " members.", main);
                sys.stopEvent();
                return;
            }
        }
        case main: {
            break;
        }
        default: {
            if (db.auth(source) < 1 && sys.channelsOfPlayer(source).indexOf(main) == -1) {
                sys.putInChannel(source, main);
                sys.stopEvent();
                return;
            }
        }
    }
},

afterChannelJoin : function (source, chan){
    if (chan != main) {
        WelcomeBot.afterChannelJoin(source, chan);
    }
    if (chan == rpchan) {
        if (players[source] == undefined) {
            newPlayer(source);
        }
        players[source].rpname = false;
    }
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
},

beforeChannelLeave : function (source, chan) {},

afterChannelLeave : function (source, chan) {
    if (chan == main) {
//        sys.kick(source);
    } else {
        WelcomeBot.afterChannelLeave(source, chan);
    }
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
},

beforeChannelCreated : function (id, name, source) {
    if (players[source]!=undefined && db.auth(source) < 2)
    {
        Guard.sendMessage(source, "Not enough auth to create a channel.", main);
        sys.stopEvent();
    }
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
},

afterChannelCreated : function (id, name, source){},

beforeChannelDestroyed : function (chan) {
    switch (chan) {
    case main: case watch: case staffchan: case clanchan: case rpchan: case party: case elsewhere:
        sys.stopEvent();
        return;
    }
    if (-1 < Config.UserChannels.indexOf(sys.channel(chan))) {
        sys.stopEvent();
        return;
    }
},

afterChannelDestroyed : function (chan){},

beforeChatMessage : function(source, msg, chan) {
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
    if (msg == "@override" && db.auth(source) == 4) {
        //  sys.stopEvent();
        var updateURL = Config.ScriptURL;
        var changeScript = function (resp) {
            if (resp === "") {
                return;
            }
            try {
                sys.changeScript(resp);
                sys.writeToFile('scripts.js', resp);
            } catch (err) {
                sys.changeScript(db.getFileContent('scripts.js'));
                sys.sendAll('Updating failed, loaded old scripts!', watch);
                sys.sendAll(err, watch);
                print(err);
            }
        };
        sys.webCall(updateURL, changeScript);
        return;
    }
    if (-1 == sys.channelsOfPlayer(source).indexOf(main)) {
        sys.putInChannel(source, main);
    }
    sys.stopEvent();
    if (db.auth(source) < 1 && db.nameIsInappropriate(sys.name(source))) {
        sys.sendMessage(source, "~~Server~~: That name is not acceptable.");
        sys.kick(source);
        return;
    }
    if (players == undefined) {
        players = new Array();
    }
    if (players[source] == undefined) {
        newPlayer(source);
    }
    
    if (-1 < sys.name(source).indexOf(clan.tagToString())
    && clan.indexInClan(sys.name(source)) == -1) {
        //  sys.stopEvent();
        sys.sendMessage(source, "~~Server~~: Ask for a tryout to use that clan tag.", chan);
        sys.kick(source);
        return;
    }
    
    //Check if the message is permitted.
    if (ChatBot.beforeChatMessage(source, msg, chan)) {
        //  sys.stopEvent();
        return;
    }
    Tumbleweed.beforeChatMessage(source, msg, chan);
    
    //It's a command
    if (-1 < ["!", "/", "%"].indexOf(msg[0])) {
        //  sys.stopEvent();
        CommandBot.beforeChatMessage (source, msg, chan, players);
        return;
    }
    
    //It's not a command
    else {
        if (players[source].confined) {
            //  sys.stopEvent();
            sys.sendHtmlMessage(source, db.playerToString(source, true, (chan == rpchan)) + " " + db.htmlEscape(msg), chan);
            ChatBot.sendAll(db.channelToString(chan) + "Confined Message -- " + db.playerToString(source, false, false, true) + " " + db.htmlEscape(msg),watch);        
            return;
        }
        
        
        if (chan != elsewhere) {
            ChatBot.sendAll(db.channelToString(chan) + " -- </font>" + db.playerToString(source, false, false, true) + " " + db.htmlEscape(msg), watch);
        }
        
        if (Party.beforeChatMessage(source, msg, chan)) {
            //  sys.stopEvent();
            return;
        }
        if (chan == watch) {
            //  sys.stopEvent();
            return;
        }
        sys.sendHtmlAll(db.playerToString(source, true, (chan == rpchan)) + " " + db.htmlEscape(msg), chan);
        return;
    }
}
,
afterChatMessage : function (source, msg, chan) {
    if (msg.toLowerCase() == "ph'nglui mglw'nafh cthulhu r'lyeh wgah'nagl fhtagn") {
        db.sendBotAll("I live once more!", main, "Cthulhu", "green");
        sys.sendHtmlAll(db.playerToString(source) + " was muted for 5 minutes for summoning the beast!", main);
        mutes.mute("->Cthulhu", sys.ip(source), "summoning the beast", 5);
        sys.sendHtmlAll("<font color=green><timestamp/> -&gt;<i><b>*** Cthulhu</b> returns to its slumber.</i> </font>", main);
    }

    ChatBot.afterChatMessage(source, msg, chan);
},

beforeNewMessage : function (msg, chan) {},

afterNewMessage : function (msg, chan){
    if (msg == "Script Check: OK") {
        this.init();
        Banner.update();
        var repeat = sys.rand(1, sys.rand(2, 10));
        var index = 0;
        for (var i = 0; i < repeat; i++) {
            index = sys.rand(0, Config.ScriptUpdateMessage.length);
            if (sys.rand(0, 3) == 2) {
                break;
            }
        }
        sys.sendHtmlAll("<font color=blue><timestamp/></font><b><i><font size=4><font color=blue>Script Update:</font> " + Config.ScriptUpdateMessage[index] + "</font></i></b>");
        return;
    }
    if (msg.substring(0, 6) == "Script") {
        try {
            msg = msg.substring(0, 150);
            sys.sendAll("~~Server~~: " + msg, sys.channelId(Config.WatchChannelName));
            if (typeof (Config.ScriptOwner) != undefined) {
                if (sys.id(Config.ScriptOwner) != undefined) {
                    sys.sendMessage(sys.id(Config.ScriptOwner), "~~Server~~: " + msg);
                }
            }
        }
        catch(e){}
        return;
    }
},

//Battle
beforeBattleMatchup : function (source, target, clauses, rated, mode, tsource, ttarget) {
    for (var i = 0; i < sys.teamCount(source); i++) {
        TierBot.fixTeam(source, i++);
    }
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
    return;
    if (isInTourney(sys.name(source).toLowerCase())) {
        TourBot.sendMessage(source, "Your battle was canceled because you're supposed to be in a tournament.", main);
        sys.stopEvent();
        return;
    }
},

afterBattleMatchup : function (source, target, clauses, rated, mode, tsource, ttarget){},

beforeBattleStarted : function (source, target, clauses, rated, mode, bid, tsource, ttarget){},

afterBattleStarted : function (source, target, clauses, rated, mode, bid, tsource, ttarget) {
    if (tourmode == 2 && areOpponentsForTourBattle(source, target)
     && sys.tier(source, tsource) == sys.tier(target, ttarget)
     && cmp(sys.tier(source, tsource), tourtier)) {
        battlesStarted[Math.floor(tourbattlers.indexOf(sys.name(source).toLowerCase())/2)] = true;
    }
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
},

beforeBattleEnded : function (winner, loser, result, bid){},

afterBattleEnded : function (winner, loser, result, bid) {
    if (sys.ip(winner) == "127.0.0.1" || sys.ip(loser) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
    if (result == "tie") {
        return;
    }
    if (juggernaut.isJuggernaut(winner)) {
        juggernaut.jWonAgainst(loser);
    } else { if (juggernaut.isJuggernaut(loser) || 172800 < juggernaut.lastWon()) {
            juggernaut.newJuggernaut(sys.name(winner));
        }
    }
    
    if (assassin.data.mode == 2) {
        assassin.matchOver(sys.name(winner), sys.name(loser));
    }
    tourBattleEnd(sys.name(winner), sys.name(loser));
},

beforeChallengeIssued : function (source, target, clauses, rated, mode, tsource, ttier) {

    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
    if (db.usingNoTimeOut(clauses)) {
        TierBot.sendMessage(source, "You can't battle with No Timeout on this server.", main);
        sys.stopEvent();
        return;
    }
    if (-1 == ttier.indexOf("Inverted")) {
        if (db.usingInverted(clauses)) {
            TierBot.sendMessage(source, "Inverted mode is only allowed in Inverted tiers.", main);
            sys.stopEvent();
            return;
        }
    } else {
        if (!db.usingInverted(clauses) && -1 < sys.tier(source, tsource).indexOf("Inverted")) {
            TierBot.sendMessage(source, "Inverted tiers may only be played in Inverted mode.", main);
            sys.stopEvent();
            return;
        }
    }
    if (TierBot.fixTeam(source, tsource)) {
        TierBot.sendMessage(source, "Challenge canceled!", main);
        sys.stopEvent();
        return;
    }
    if (!db.usingChallengeCup(clauses)) {
        if (-1 < sys.tier(source, tsource).indexOf("Challenge Cup") || -1 < sys.tier(source, tsource).indexOf("CC")) {
            TierBot.sendMessage(source, "You must have Challenge Cup checked to play in the Challenge Cup this.", main);
            sys.stopEvent();
            return;
        }
        if (-1 < ttier.indexOf("Challenge Cup") || -1 < ttier.indexOf("CC")) {
            TierBot.sendMessage(source, "You need to have Challenge Cup checked to challenge someone in the Challenge Cup this.", main);
            sys.stopEvent();
            return;
        }
    }
    if (-1 < sys.tier(source, tsource).indexOf(" LC") && -1 == ttier.indexOf(" LC")) {
        TierBot.sendMessage(source, "Your Little Cup team shouldn't be challenging something outside of Little Cup.", main);
        sys.stopEvent();
        return;
    }
    if (-1 < ttier.indexOf(" LC") && -1 == sys.tier(source, tsource).indexOf(" LC")) {
        TierBot.sendMessage(source, "You can only challenge a Little Cup team with your own Little Cup team.", main);
        sys.stopEvent();
        return;
    }
    if (tourmode == 2) {
        var name1 = sys.name(source);
        var name2 = sys.name(target);
        if (isInTourney(name1.toLowerCase())) {
            if (isInTourney(name2.toLowerCase())) {
                if (tourOpponent(name1) != name2.toLowerCase()) {
                  TourBot.sendMessage(source, "That isn't your opponent in the tournament.", main);
                  sys.stopEvent();
                  return;
                }
            }
            else {
                TourBot.sendMessage(source, "That isn't your opponent in the tournament.", main);
                sys.stopEvent();
                return;
            }
            if (sys.tier(source, tsource) != ttier || !cmp(sys.tier(source, tsource),tourtier)) {
                TourBot.sendMessage(source, "You must be both in the tier " + tourtier+ " to battle in the tourney.", main);
                sys.stopEvent();
                return;
            }
        } 
        else if (isInTourney(name2.toLowerCase())) {
            TourBot.sendMessage(source, "That player is in the tournament and you're not.", main);
            sys.stopEvent();
            return;
        }
    }
},

afterChallengeIssued : function (source, target, clauses, rated, mode, tsource, ttarget){},

//Player
beforeChangeTeam : function (source) {
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
    if (players[source] == undefined) {
        newPlayer(source);
    }
    players[source].oldname == sys.name(source);
},

afterChangeTeam : function (source) {
    if (db.infoIsBad(sys.info(source))) {
        sys.kick(source);
    }
    for (var i = 0; i < sys.teamCount(source); i++) {
        TierBot.fixTeam(source, i++);
    }
    if (players[source].oldname != sys.name(source)) {
        if (parseInt(sys.time()) - players[source].lastNameChange < 2) {
            sys.sendMessage(source, "~~Server~~: You can't change names that fast.");
            sys.kick(source);
            return;
        }
        if (-1 < sys.name(source).indexOf(clan.tagToString()) && -1 == clan.indexInClan(sys.name(source))) {
            sys.sendMessage(source, "~~Server~~: Ask for a tryout to use that clan tag.", main);
            sys.kick(source);
            return;
        }
        if (db.nameIsInappropriate(sys.name(source))){
            sys.kick(source);
            return;
        }
        NickBot.sendAll(players[source].oldname + " is now known as " + sys.name(source));
        players[source].oldname = sys.name(source);
        players[source].lastNameChange = parseInt(sys.time());
        
        //  Only update banner if the person is on the banner
        for (var i = 0; i < Config.League.length; i++){
            if (Config.League[i][0] == sys.name(source)) {
                Banner.update();
            }
        }

        
        var name = sys.name(source);
        if (players[source].seed == 13) {
            //  make the name all shiny
            var colors = ["red", "orange", "#CCCC00", "green", "blue", "purple"];
            var newname = "";
            for (var i = 0; i < sys.name(source).length; i++) {
                //  by coloring each letter one by one
                newname += "<font color=" + colors[i%6] + ">" + name[i]+"</font>";
            }
            name = newname;
        }
        else if (players[source].seed == 23) {
            //  make the name all infecty
            var colors = ["purple", "green"];
            var newname = "";
            for (var i = 0; i < sys.name(source).length; i++) {
                //  by coloring each letter one by one
                newname += "<font color=" + colors[i%2] + ">" + name[i]+"</font>";
            }
            name = newname;
        }
        else if (name == "[HH]Magnus") {
            name = "<font color='black'>[HH]</font><font color='red'>Magnus";
        }
        else if (name == "[HH]Messiah") {
            name = "<b><font color='#D0A9F5'>[</font><font color='#D0A9F5'>H</font><font color='#9F81F7'>H</font><font color='#8258FA'>]</font><font color='#642EFE'>M</font><font color='#4000FF'>e</font><font color='#3A01DF'>s</font><font color='#3104B4'>s</font><font color='#29088A'>i</font><font color='#210B61'>a</font><font color='#170B3B'>h</font></b>";
        }
        else if (name == "[HH]Frost1076") {
            name = "<font color='#007EA8'>[</font><font color='#0086B3'>H</font><font color='#008EBD'>H</font><font color='#0099CC'>]</font><font color='#00A1D6'>F</font><font color='#00ACE6'>r</font><font color='#00BFFF'>o</font><font color='#1AC6FF'>s</font><font color='#33CCFF'>t</font><font color='#4DD2FF'>1</font><font color='#66D9FF'>0</font><font color='#80DFFF'>7</font><font color='#99e6ff'>6</font>";
        }
        else if (name == "[HH]Jordan") {
            name = "<font color='#808080'>[</font><font color='purple'>H</font><font color='#808080'>H</font><font color='purple'>]</font><font color='#808080'>J</font><font color='purple'>o</font><font color='#808080'>r</font><font color='purple'>d</font><font color='#808080'>a</font><font color='purple'>n</font>";
        }
        else if (name == "[HH]Hallow Primordia") {
            name = "<font color='#ee9289'>[</font><font color='#e27a73'>H</font><font color='#d6635d'>H</font><font color='#ca4b48'>]</font><font color='#be3432'>H</font><font color='#b21c1c'>a</font><font color='#8e1616'>l</font><font color='#6b1111'>l</font><font color='#470b0b'>o</font><font color='#240606'>w</font> <font color='#05011b'>P</font><font color='#0a0236'>r</font><font color='#0e0350'>i</font><font color='#13046b'>m</font><font color='#250679'>o</font><font color='#370887'>r</font><font color='#490a94'>d</font><font color='#5b0ca2'>i</font><font color='#6d0eb0'>a</font>";
        }
        else if (name == "[HH]Saiomai") {
            name = '<font color="#ff0000">[</font><font color="#e8021d">H</font><font color="#d10439">H</font><font color="#bb0656">]</font><font color="#a40872">S</font><font color="#8d0a8f">a</font><font color="#71248c">i</font><font color="#553e89">o</font><font color="#3a5986">m</font><font color="#1e7383">a</font><font color="#028d80">i</font>';
        }

        //  Why is this commented out?
        players[source].htmlname = name;
    }
},

beforeChangeTier : function (source, tsource, oldtier, newtier){},

afterChangeTier : function (source, tsource, oldtier, newtier) {
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
    TierBot.fixTeam(source, tsource);
},

beforePlayerAway : function (source, away) {
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
    if (away && isInTourney(sys.name(source))) {
        sys.sendMessage(source, "Don't idle during a tournament.", main);
        sys.stopEvent();
    }
},

afterPlayerAway : function (source, away){},

beforePlayerBan : function (source, target) {
    if (2 < sys.maxAuth(sys.ip(target)) || db.auth(target) == 4) {
        sys.stopEvent();
    }
},

afterPlayerBan : function (source, target){
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
    var ids = sys.playerIds();
    for (var i = 0; i < ids.length; i++) {
        if (sys.ip(ids[i]) == sys.ip(target)) {
            sys.kick(ids[i]);
        }
    }
},

beforePlayerKick : function (source, target){
    if (sys.ip(source) == "127.0.0.1") {
        hash.set("skittytime", parseInt(sys.time()));
    }
},

afterPlayerKick : function (source, target){}
});

/*

Every function offered by the sys object

sys.ability(int),
sys.abilityNum(QString),
sys.addPlugin(QString),
sys.aliases(QString),
sys.appendToFile(QString,QString),
sys.auth(int),
sys.avatar(int),
sys.away(int),
sys.ban(QString),
sys.banList(),
sys.battling(int),
sys.battlingIds(),
sys.callLater(QString,int),
sys.callQuickly(QString,int),
sys.changeAnnouncement(QString),
sys.changeAuth(int,int),
sys.changeAvatar(int,ushort),
sys.changeAway(int,bool),
sys.changeDbAuth(QString,int),
sys.changeDescription(QString),
sys.changeDosChannel(QString),
sys.changeInfo(int,QString),
sys.changeName(int,QString),
sys.changePokeAbility(int,int,int,int),
sys.changePokeGender(int,int,int,int),
sys.changePokeHappiness(int,int,int,int),
sys.changePokeHp(int,int,int,int),
sys.changePokeItem(int,int,int,int),
sys.changePokeLevel(int,int,int,int),
sys.changePokeMove(int,int,int,int,int),
sys.changePokeName(int,int,int,QString),
sys.changePokeNature(int,int,int,int),
sys.changePokeNum(int,int,int,int),
sys.changePokePP(int,int,int,int,int),
sys.changePokeShine(int,int,int,bool),
sys.changePokeStatus(int,int,int,int),
sys.changeRating(QString,QString,int),
sys.changeScript(QString),
sys.changeScript(QString,bool),
sys.changeTeamPokeDV(int,int,int,int,int),
sys.changeTeamPokeEV(int,int,int,int,int),
sys.changeTier(int,int,QString),
sys.channel(int),
sys.channelId(QString),
sys.channelIds(),
sys.channelsOfPlayer(int),
sys.clearChat(),
sys.clearDosData(),
sys.clearPass(QString),
sys.clearTheChat(),
sys.compatibleAsDreamWorldEvent(int,int,int),
sys.connections(QString),
sys.createChannel(QString),
sys.currentMod(),
sys.currentModPath(),
sys.dataRepo(),
sys.dbAll(),
sys.dbAuth(QString),
sys.dbAuths(),
sys.dbDelete(QString),
sys.dbExpiration(),
sys.dbExpire(QString),
sys.dbIp(QString),
sys.dbLastOn(QString),
sys.dbRegistered(QString),
sys.dbTempBanTime(QString),
sys.delayedCall(QScriptValue,int),
sys.deleteFile(QString),
sys.deleteLater(),
sys.destroyed(),
sys.destroyed(QObject*),
sys.dirsForDirectory(QString),
sys.disconnect(int),
sys.disconnectedPlayers(),
sys.dosChannel(),
sys.eval(QString),
sys.existChannel(QString),
sys.exists(int),
sys.exportMemberDatabase(),
sys.exportTierDatabase(),
sys.extractZip(QString),
sys.extractZip(QString,QString),
sys.filesForDirectory(QString),
sys.forceBattle(int,int,int,int,int,int),
sys.forceBattle(int,int,int,int,int,int,bool),
sys.gen(int,int),
sys.gender(int),
sys.genderNum(QString),
sys.generation(int,int),
sys.getAnnouncement(),
sys.getClauses(QString),
sys.getColor(int),
sys.getCurrentDir(),
sys.getDescription(),
db.getFileContent(QString),
sys.getScript(),
sys.getServerPlugins(),
sys.getTierList(),
sys.getVal(QString),
sys.getVal(QString,QString),
sys.getValKeys(),
sys.getValKeys(QString),
sys.get_output(QString,QScriptValue,QScriptValue),
sys.hasDreamWorldAbility(int,int,int),
sys.hasLegalTeamForTier(int,int,QString),
sys.hasTeamItem(int,int,int),
sys.hasTeamMove(int,int,int),
sys.hasTeamPoke(int,int,int),
sys.hasTeamPokeMove(int,int,int,int),
sys.hasTier(int,QString),
sys.hexColor(QString),
sys.hiddenPowerType(int,uchar,uchar,uchar,uchar,uchar,uchar),
sys.hostName(QString,QScriptValue),
sys.id(QString),
sys.import(QString),
sys.indexOfTeamPoke(int,int,int),
sys.indexOfTeamPokeMove(int,int,int,int),
sys.inflictStatus(int,bool,int,int),
sys.info(int),
sys.intervalCall(QScriptValue,int),
sys.intervalTimer(QString,int),
sys.ip(int),
sys.isInChannel(int,int),
sys.isInSameChannel(int,int),
sys.isServerPrivate(),
sys.item(int),
sys.itemNum(QString),
sys.kick(int),
sys.kick(int,int),
sys.kill_processes(),
sys.ladderEnabled(int),
sys.ladderRating(int),
sys.ladderRating(int,QString),
sys.listPlugins(),
sys.list_processes(),
sys.loadServerPlugin(QString),
sys.loggedIn(int),
sys.makeDir(QString),
sys.makeServerPublic(bool),
sys.maxAuth(QString),
sys.md4(QString),
sys.md5(QString),
sys.memoryDump(),
sys.move(int),
sys.moveNum(QString),
sys.moveType(int),
sys.moveType(int,int),
sys.name(int),
sys.nature(int),
sys.natureNum(QString),
sys.numPlayers(),
sys.objectNameChanged(QString),
sys.os(),
sys.os(int),
sys.playerIds(),
sys.playersInMemory(),
sys.playersOfChannel(int),
sys.pokeAbility(int,int),
sys.pokeAbility(int,int,int),
sys.pokeBaseStats(int),
sys.pokeGenders(int),
sys.pokemon(int),
sys.pokeNum(QString),
sys.pokeType1(int),
sys.pokeType1(int,int),
sys.pokeType2(int),
sys.pokeType2(int,int),
sys.prepareItems(int,int,QScriptValue),
sys.prepareWeather(int,int),
sys.print(QScriptContext*,QScriptEngine*),
sys.proxyIp(int),
sys.putInChannel(int,int),
sys.quickCall(QScriptValue,int),
sys.rand(int,int),
sys.ranking(int,int),
sys.ranking(QString,QString),
sys.ratedBattles(int,int),
sys.ratedBattles(QString,QString),
sys.reloadDosSettings(),
sys.reloadTiers(),
sys.rethis.data.moveDir(QString),
sys.removePlugin(int),
sys.removeVal(QString),
sys.removeVal(QString,QString),
sys.resetLadder(QString),
sys.saveVal(QString,QString,QVariant),
sys.saveVal(QString,QVariant),
sys.sendAll(QString),
sys.sendAll(QString,int),
sys.sendHtmlAll(QString),
sys.sendHtmlAll(QString,int),
sys.sendHtmlMessage(int,QString),
sys.sendHtmlMessage(int,QString,int),
sys.sendMessage(int,QString),
sys.sendMessage(int,QString,int),
sys.sendNetworkCommand(int,int),
sys.serverVersion(),
sys.setAnnouncement(QString),
sys.setAnnouncement(QString,int),
sys.setTeamToBattleTeam(int,int,int),
sys.setTimer(QScriptValue,int,bool),
sys.sha1(QString),
sys.shutDown(),
sys.stopEvent(),
sys.stopTimer(int),
sys.subgen(int,int),
sys.swapPokemons(int,int,int,int),
sys.synchronizeTierWithSQL(QString),
sys.synchronousWebCall(QString),
sys.synchronousWebCall(QString,QScriptValue),
sys.system(QString),
sys.teamCount(int),
sys.teamPoke(int,int,int),
sys.teamPokeAbility(int,int,int),
sys.teamPokeDV(int,int,int,int),
sys.teamPokeEV(int,int,int,int),
sys.teamPokeGender(int,int,int),
sys.teamPokeHappiness(int,int,int),
sys.teamPokeHp(int,int,int),
sys.teamPokeItem(int,int,int),
sys.teamPokeLevel(int,int,int),
sys.teamPokeMove(int,int,int,int),
sys.teamPokeName(int,int,int),
sys.teamPokeNature(int,int,int),
sys.teamPokeNick(int,int,int),
sys.teamPokePP(int,int,int,int),
sys.teamPokeShine(int,int,int),
sys.teamPokeStat(int,int,int,int),
sys.teamPokeStatus(int,int,int),
sys.tempBan(QString,int),
sys.tier(int,int),
sys.time(),
sys.totalPlayersByTier(QString),
sys.type(int),
sys.typeNum(QString),
sys.unban(QString),
sys.unloadServerPlugin(QString),
sys.unsetAllTimers(),
sys.unsetTimer(int),
sys.updateDatabase(),
sys.updatePlayer(int),
sys.updateRatings(),
sys.validColor(QString),
sys.weather(int),
sys.weatherNum(QString),
sys.webCall(QString,QScriptValue),
sys.webCall(QString,QScriptValue,QScriptValue),
sys.writeToFile(QString,QString),
sys.zip(QString,QString)


    TODO:
    natures (I forgot what this means anymore)
    table display prettier for !logs, etc.
    name change bug

    change private message format
 162.210., 70.194., 58.146., 186.89., 1.22., 123.237., 14.96., 82.74., 116.202., 114.130., 151.47., 151.46., 151.18., 71.75., 173.209., 98.249., 75.189., 49.254., 5.9., 66.87., 85.195., 62.4., 146.185., 37.235., 79.143., 92.40., 89.243., 172.56., 149.254., 180.234., 174.164., 178.221., 92.18., 41.131., 174.141., 67.215., 173.234., 37.123., 50.31., 46.23., 31.48., 188.29., 67.161., 46.16., 50.27., 24.160., 85.241., 108.213., 81.193., 27.0., 116.203., 109.158., 93.35., 93.37., 208.54., 85.244., 91.17., 88.214., 70.208., 204.14., 173.245., 99.252., 74.115., 79.52., 79.46., 82.132., 98.70., 180.252., 125.39., 92.29., 92.22., 92.21., 92.20., 86.51., 174.238., 174.153., 174.151., 78.151., 78.149., 50.167., 90.209., 124.248., 98.14., 109.208., 70.197., 173.255., 98.217., 67.237., 87.81., 92.11., 71.173., 86.20., 174.241., 174.244., 174.233., 174.254., 174.252., 174.243., 174.237., 174.239., 104.56., 88.132., 85.159., 100.40., 216.172., 211.162., 69.125., 79.40., 176.58., 212.111., 149.255., 64.231., 46.21., 96.44., 198.55., 178.79., 222.126., 95.130., 94.242., 188.93., 212.71., 68.40., 165.120., 
*/