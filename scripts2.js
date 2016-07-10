/*--------------------------------*/
//        GKSudo's Script #       // 
/*--------------------------------*/

var Config {
  //  The name of the server
  serverName: 'And Another Thing...',

  //  The server-enforced clan tag
  clanTag: '[HH]',

  //  The link to the server's forum
  forum: 'http://w11.zetaboards.com/The_Valley/index/',

  //  Default room
  mainChannel: 'The Restaurant',

  //  Room to send auth alerts
  authChannel: 'Auth Party',

  //  Room to stalk users
  watchChannel: 'Watch',

  //  Special commands can change this channel's behavior
  partyChannel: 'Party',

  //  Only clan members may join here
  clanChannel: 'The Mosh Pit',

  //  PP usage does not count here
  rolePlayingChannel: 'Role Playing',

  //  Channel restricted to super users. Messages here are automatically eval'ed
  shellChannel: '$ sudo -l',

  //  This channel is entirely exempt from the watch channel
  elsewhere: 'Elsewhere',

  //  Channels that have no special features
  userChannels: [
    'Lumiose City',
  ],

  //  Channel colors for printing
  channelColors: [
    'orange',
    'purple',
    'green',
    'red',
    'black',
    'grey',
    'brown'
  ],

  //  List of users who have super user priveledges
  superUsers: [
    '[HH]Ender',
    '[HH]SleepingGiant'
  ],

  //  The server rules
  rules: [
    'We are all here to have fun. Keep drama offline and out of chat and PM\'s.',
    'If there is a real life emergency, call the police, not the internet!',
    'This community is a getaway from drama. Please refrain from bringing some with you.',
    'Don\'t spoil the new games. Also don\'t spoil other things like tv shows or books.',
    'Bad luck happens. Whine about it once and move on. If you can\'t do that, you should not be playing Pokemon.',
    'Do not demand that other players speak your language. This is an open community and internet translators exist.',
    'Keep the atmosphere positive. This includes Private Messages as well as chat.',
    'No rules apply in the #' + this.elsewhere + ' room. Nothing there is logged and the auth cannot read these from #' + this.watchChannel
  ],

  //  Usernames with unique appearances
  htmlNames : {
    '[HH]エンダ': "<font color='#aa50aa'>[HH]</font><font color='#cd568a'>エンダ</font>",
    '[HH]Ender': "<font color='#aa50aa'>[HH]</font><font color='#cd568a'>Ender</font>",
    '[HH]Magnus': "<font color='black'>[HH]</font><font color='red'>Magnus",
    '[HH]Messiah': "<font color='#D0A9F5'>[</font><font color='#D0A9F5'>H</font><font color='#9F81F7'>H</font><font color='#8258FA'>]</font><font color='#642EFE'>M</font><font color='#4000FF'>e</font><font color='#3A01DF'>s</font><font color='#3104B4'>s</font><font color='#29088A'>i</font><font color='#210B61'>a</font><font color='#170B3B'>h</font>",
    '[HH]Frost1076': "<font color='#007EA8'>[</font><font color='#0086B3'>H</font><font color='#008EBD'>H</font><font color='#0099CC'>]</font><font color='#00A1D6'>F</font><font color='#00ACE6'>r</font><font color='#00BFFF'>o</font><font color='#1AC6FF'>s</font><font color='#33CCFF'>t</font><font color='#4DD2FF'>1</font><font color='#66D9FF'>0</font><font color='#80DFFF'>7</font><font color='#99e6ff'>6</font>",
    '[HH]Excaria': "<font color='#ff0000'>[HH]E</font><font color='#d60000'>x</font><font color='#ab0000'>c</font><font color='#7c0101'>a</font><font color='#530000'>r</font><font color='#280000'>i</font><font color='#000000'>a</font>",
    '[HH]Jordan': "<font color='#236A62'>[</font><font color='#549431'>H</font><font color='#236A62'>H</font><font color='#549431'>]</font><font color='#236A62'>J</font><font color='#549431'>o</font><font color='#236A62'>r</font><font color='#549431'>d</font><font color='#236A62'>a</font><font color='#549431'>n</font>",
    '[HH]Hallow Primordia': "<font color='#ee9289'>[</font><font color='#e27a73'>H</font><font color='#d6635d'>H</font><font color='#ca4b48'>]</font><font color='#be3432'>H</font><font color='#b21c1c'>a</font><font color='#8e1616'>l</font><font color='#6b1111'>l</font><font color='#470b0b'>o</font><font color='#240606'>w</font> <font color='#05011b'>P</font><font color='#0a0236'>r</font><font color='#0e0350'>i</font><font color='#13046b'>m</font><font color='#250679'>o</font><font color='#370887'>r</font><font color='#490a94'>d</font><font color='#5b0ca2'>i</font><font color='#6d0eb0'>a</font>",
    '[HH]Saiomai': "<font color='#ff0000'>[</font><font color='#e8021d'>H</font><font color='#d10439'>H</font><font color='#bb0656'>]</font><font color='#a40872'>S</font><font color='#8d0a8f'>a</font><font color='#71248c'>i</font><font color='#553e89'>o</font><font color='#3a5986'>m</font><font color='#1e7383'>a</font><font color='#028d80'>i</font>",
    '[HH]Sora': "<font color='#ff0000'>[</font><font color='#d03b25'>H</font><font color='#a1764a'>H</font><font color='#a6896c'>]</font><font color='#ab9d8e'>S</font><font color='#b0b0b0'>o</font><font color='#58abd8'>r</font><font color='#00a5ff'>a</font>",
    '[HH]SemiBolt': "<font color='#01DFD7'>[HH]Semi<font color='#00FFBF'>Bolt</font>"
  },

  //  These cannot be part of a name (name is converted to lowercase on the check)
  badNames : ["muhammad", "$g", "[hh[", "]hh]", "]hh[", "{hh}", "{hh]", "[hh}", "[hhh]", "[vp]", "69", "anus", "anvs", "bich", "bitch", "bltch", "chatbot", "christ", "chrlst", "cock", "command", "creeper", "cum", "cvm", "cunt", "cvnt", "dlck", "dick", "ejaculate", "fag", "fck", "fuck", "fvck", "fuhrer", "fvhrer", "fuk", "fvk", "gbrother", "god", "goodbye", "harmless", "heil", "hiel", "hitchhiker", "hitler", "horny", "jesus", "jesvs", "kbot", "knight of zero", "kyubey", "masterbate", "masterbait", "mostly", "nigg", "penis", "porn", "pure", "pvre", "pussy", "pvssy", "pusy", "server", "sex", "shit", "slap", "std", "swag", "tier", "troll", "vagina", "uagina", "vaglna", "valley", "vfd", "welcome", "ender", "shofu", "kirby", "[vp]"],

  //  Base URL to fetch scripts from
  scriptURL: 'https://github.com/todd-beckman/MostlyHarmlessServer/master/',

  //  Subdirectory to fetch modules from
  moduleURL: 'modules/'
};

//  Returns the ID of the channel, and creates it if it doesn't exist
function createChannel(name) {
  if (sys.existChannel(name)) {
    return sys.channelId(name);
  }
  return sys.createChannel(name);
}

//  Create channels ahead of time since the 'require' code needs a place to print
var
  main = createChannel(Config.mainChannel),
  auth = createChannel(Config.authChannel),
  watch = createChannel(Config.watchChannel),
  clanChan = createChannel(Config.clanChannel),
  rpchan = createChannel(Config.rolePlayingChannel),
  shell = createChannel(Config.shellChannel),
  elsewhere = createChannel(Config.elsewhere);

for (var i = 0; i < config.userChannels.length; i++) {
  createChannel(Config.userChannels[i]);
}

//  'Borrowed' from: po-devs/po-server-goodies
var requireCache = typeof require != 'undefined' ? require.cache : {};
var require = function require(moduleName, retry) {
  if (require.cache[moduleName]) {
    return require.cache[moduleName];
  }
  var module = {};
  module.module = module;
  module.exports = {};
  module.source = moduleName;

  with (module) {
    var location = Config.moduleURL + moduleName;
    var content = sys.getFileContent(location);

    if (content) {
      try {
        eval(sys.getFileContent(location));
        sys.writeToFile(location + '-b', sys.getFileContent(location));
      }
      catch(e) {
        sys.sendAll('Error loading module ' + moduleName + ': ' + e + (e.lineNumber ? ' on line: ' + e.lineNumber : ''), auth);
        sys.writeToFile(location, sys.getFileContent(location + '-b'));
        
        if (!retry) {
          require(moduleName, true);
        }
      }
    }
  }
  require.cache[moduleName] = module.exports;
  return module.exports;
};
require.cache = requireCache;

//  Also 'borrowed'
var updateModule = function updateModule(moduleName, callback) {
  var url;
  var location = Config.moduleURL + fname;
  if (/^https?:\/\//.test(moduleName)) {
    url = moduleName;
  }
  else {
    url = Config.scriptURL + location;
  }
  if (!callback) {
    var resp = sys.synchronousWebCall(url);
    if (resp === '') {
      return {};
    }
    sys.writeToFile(location, resp);
    delete require.cache[location];
    var module = require(location);
    return module;
  }
  else {
    sys.webCall(url, function updateModule_callback(resp) {
      if (resp === '') {
        return;
      }
      sys.writeToFile(location, resp);
      delete require.cache[location];
      var module = require(location);
      callback(module);
    });
  }
};

//  All variables must be declared outside of the script
var initialized = false, players, newPlayers,
  //  Alphabetized
  _, awards, Bot, chatbot, commandbot,
  db, Guard, ipbans,
  juggernaut, logs, mutes, newPlayer, nickbot,
  rangeban, pictures, tierbot,
  tourbot, tumbleweed, welcomebot;

poScript = ({

//  This event handles creating a new server
//  Triggered on server start or on script update
init: function() {
  initialized = false;

  //  Required for everything
  _ = require('helpers.js').Helpers;
  Bot = require('bot.js').Bot;

  //  Basic bots
  Guard = new Bot('魂魄妖夢', '#008080');
  nickbot = new Bot('Nickserv', '#0000');
  cthulhu = new Bot('Cthulhu', 'green');

  //  Bookkeeping
  db = require('db.js').DB;
  logs = require('authlogs.js').Logs;

  //  Games
  awards = require('awards.js').Awards;
  juggernaut = require('juggernaut.js').Juggernaut;
  pictures = require('pictures.js').Pictures;
  tourbot = require('tournaments.js').Tournaments;

  //  Moderating
  mutes = require('mutes.js').Mutes;
  ipbans = require('ipbans.js').IPBans;
  rangebans = require('rangebans.js').RangeBans;

  //  Things that depend on everything else
  banner = require('banner.js').Banner;
  chatbot = require('chatbot.js').ChatBot;
  welcomebot = require('welcomebot.js').WelcomeBot;
  tumbleweed = require('tumbleweed.js').Tumbleweed;

  //  This must come last or everything will break
  commandbot = require('commandbot.js').CommandBot;
  commandbot.registerCommandsFrom([
    require('awards.js').Commands,
    require('banner.js').Commands,
    require('chatbot.js').Commands,
    require('ipbans.js').Commands,
    require('juggernaut.js').Commands,
    require('mutes.js').Commands,
    require('pictures.js').Commands,    
    require('rangebans.js').Commands,
    require('tournaments.js').Commands,
    //  This feature may be reimplemented later
    //require('party.js').Commands,

    require('commands_hidden.js').Commands,
    require('commands_user.js').Commands,
    require('commands_mod.js').Commands,
    require('commands_admin.js').Commands,
    require('commands_owner.js').Commands,
    require('commands_mod.js').Commands,
  ]);

  if (typeof(players) == 'undefined') {
    players = [];
  }
  newPlayer = function(source) {
    var time = parseInt(sys.time());
    var name = sys.name(source);
    players[source] = {
      confined: false,
      ip: sys.ip(source),
      floodCount: 0,
      lastCommand: time,
      lastNameChange: time,
      htmlname: _.getPlayerHtmlName(source),
      oldName: name,
      online: true,
      seed: 8000,
      showGoodbye: true,
      timeCount: time,
      ppMax: 100,
      ppLeft: 10,
      zp: 0
    };

    if (awards.hasAward(name, 'Developers Developers Developers Developers')) {
      players[source].ppMax += 50;
    }
    if (awards.hasAward(name, 'Ender\'s Jeesh')) {
      players[source].ppMax += 50;
    }
  };

  banner.update();
  banner.setDescription();
  initialized = true;
},

serverStartUp: function() {
  this.init();

  //  Shuffles the random seed. No idea why this is a thing
  var repeat = sys.rand(1, sys.rand(2, 10));
  for (var i = 0; i < repeat; i++) {
    if (sys.rand(0, 3) == 2) {
      break;
    }
  }
},

step: function() {
  if (!initialized) {
    return;
  }
  Tumbleweed.step();
  Banner.step();
},

beforeIPConnected: function(ip) {
  if (!initialized) {
    return;
  }
  if (ipbans.isBanned(ip)) {
    sys.sendAll('IP-banned IP ' + ip + ' was rejected.', watch);
    sys.stopEvent();
    return;
  }
  if (rangebans.isBanned(ip)) {
    sys.sendAll('Rangebanned IP ' + ip + ' was rejected.', watch);
    ipbans.ban(ip);
    sys.stopEvent();
    return;
  }
},

beforeLogIn: function(source) {
  if (!initialize) {
    return;
  }
  var name = sys.name(source);
  if (-1 < name.indexOf(Config.clanTag) && -1 == clan.indexInClan(name)) {
    sys.sendMessage(source, '~~Server~~: You must be a registered clan member to use the tag.');
    sys.sendAll(name + ' was rejected for not being in the clan.', watch);
    sys.stopEvent();
    return;
  }
  if (db.get('lockdown') && -1 == name.indexOf(Config.clanTag)) {
    sys.sendAll('~~Server~~: ' + sys.name(source) = ' was rejected due to a lockdown.', watch);
    sys.stopEvent();
    return;
  }
},

afterLogIn: function(source) {
  if (!initialized) {
    return;
  }
  if (players[source] == undefined) {
    newPlayer(source);
  }
  var name = sys.name(source);
  players[source].showgoodbye = false;
  if (_.auth(source) < 1 && _.nameIsInappropriate(name)) {
    sys.sendMessage(source, '~~Server~~: That name is not acceptable.');
    sys.kick(source);
    return;
  }
  players[source].showgoodbye = true;

  welcomebot.afterLogIn(source);
  tierbot.afterLogIn(source);
  tourbot.afterLogIn(source);
  mutes.afterLogIn(source);

  if (0 < _.auth(source)) {
    try {
      var message = db.get('authnote');
      if (message.length != 0) {
        sys.sendMessage(source, '~~Server~~: Auth Note: ' + message, main);
      }
    }
    catch (e) {
      db.set('authnote', 'Invalid authnote was set. Please replace it with /authnote');
      sys.sendMessage(source, '~~Server~~: Auth Note: ' + message, main);
    }
  }
},

beforeLogOut: function(source) {
  if (!initialized) {
    return;
  }
  //  Race conditions can cause unregistered players to error out
  if (players[source] == undefined) {
    newPlayer(source);
  }
  if (players[source].showgoodbye) {
    welcomebot.afterLogOut(source);
  }
  players[source].online = false;
},

beforeChannelJoin: function(source, channel) {
  if (!initialized) {
    return;
  }
  if (-1 < Config.userChannels.indexOf(sys.channel(channel))) {
    return;
  }
  switch (channel) {
    case staffchan: case watch:
      if (_.auth(source) == 0 && db.get('allowstaffchan').indexOf(sys.name(source).toLowerCase())) {
        Guard.sendMessage(source, 'Only Auth are allowed in that channel.', main);
        sys.stopEvent();
      }
      break;
    case clanchan:
      if (-1 == sys.name(source.indexOf(Config.clanTag()))) {
        sys.sendMessage(source, '~~Server~~: Only clan members are allowed in that channel.', main);
        sys.stopEvent();
      }
      break;
  }
  if (!sys.isInChannel(source, main)) {
    sys.putInChannel(source, main);
  }
},

afterChannelJoin: function(source, channel) {
  if (!initialized) {
    return;
  }
  if (channel != main) {
    welcomebot.afterChannelJoin(source, channel);
  }
},

afterChannelLeave: function(source, channel) {
  if (!initialized) {
    return;
  }
  if (channel != main) {
    welcomebot.afterChannelLeave(source, channel);
  }
},

beforeChannelCreated: function(channel, name, source) {
  if (!initialized) {
    return;
  }
  if (players[source] != undefined && _.auth(source) < 2) {
    Guard.sendMessage(source, 'You do not have the authority to create a channel.', main);
    sys.stopEvent();
  }
},

beforeChannelDestroyed: function(channel) {
  if (!initialized) {
    return;
  }
  if (-1 < Config.userChannels.indexOf(sys.channel(chan))) {
    sys.stopEvent();
    return;
  }
  switch (channel) {
    case main: case watch: case staffchan: case clanchan: case rpchan: case elsewhere: case shell: case party:
      sys.stopEvent();
      return;
  }
}

beforeChatMessage: function(source, message, channel) {
  var name = sys.name(source);

  //  Hail Mary: Allow remote script update even with script errors
  if (Config.superUsers.indexOf(name) != 0) {
    if (message == '@hailmary') {
      //  Redefinition of script update because it might not be around
      var updateURL = Config.baseURL + 'scripts.js';
      var changeScript = function(response) {
        if (response == '') {
          return;
        }
        try {
          sys.changeScript(response);
          sys.writeToFile('scripts.js', response);
        }
        catch (e) {
          print(e);
          sys.changeScript(_.getFileContent('scripts.js'));
          sys.sendAll('Update failed! Keeping old script.');
          sys.sendAll(error, watch);
        }
      };
      sys.webCall(updateURL, changeScript);
      sys.stopEvent();
      return;
    }
  }

  //  Now check for initialization
  if (!initialized) {
    return;
  }
  try {
    if (!sys.isInChannel(source, main)) {
      sys.putInChannel(source, main);
    }
    sys.stopEvent();
    if (players == undefined) {
      players = new Array();
    }
    if (players[source] == undefined) {
      newPlayer(source);
    }

    if (0 == message.length) {
      sys.sendMessage(source, '~~Server~~: Maybe the chat would be more active if you said something of value.', channel);
      chatbot.sendAll(_.channelToString(channel) + ' -- </font>' + _.playerToString(source, false, false, true) + ' ' + message, watch);
      return;
    }

    //  Enforce these rules all the time
    if (_.nameIsInappropriate(name)) {
      sys.sendMessage(source, '~~Server~~: That name is not acceptable.', chan);
      sys.kick(source);
      return;
    }
    if (-1 < name.indexOf(Config.clanTag) && -1 == clan.indexInClan(name)) {
      sys.sendMessage(source, '~~Server~~: This name is not registered with the clan.', channel);
      sys.kick(source);
      return;
    }

    if (chatbot.beforeChatMessage(source, message, channel)) {
      return;
    }
    tumbleweed.beforeChatMessage(source, message, channel);
    if (message[0] == '/') {
      if (message[1] == '/') {
        message.splice(0, 1);
      }
      else {
        CommandBot.beforeChatMessage(source, message, chan);
        return;
      }
    }
    else {
      if (players[source].confined) {
        sys.sendHtmlMessage(source, _.playerToString(source, true, channel == rpchan) + ' ' + _.htmlEscape(message), channel);
        chatbot.sendAll(_.channelToString(channel) + 'Confined Message -- ' + _.playerToString(source, false, false, true) + ' ' + _.htmlEscape(message), watch);
        return;
      }
      if (channel != elsewhere) {
        chatbot.sendAll(_.channelToString(channel) + ' -- </font>' + _.playerToString(source, false, false, true) + ' ' + _.htmlEscape(message), watch);
      }
      if (channel == watch) {
        return;
      }
      if (channel == party) {
        Party.beforeChatMessage(source, message, channel);
        return;
      }
      sys.sendHtmlAll(_.playerToSTring(source, true, channel == rpchan) + ' ' + _.htmlEscape(message), channel);
      return;
    }
  }
  //  For safety, print the message. Otherwise the chat will be unresponsive
  catch (e) {
    _.sendAlert('Error in beforeChatMessage', e);
    sys.sendHtmlAll(_.playerToSTring(source, true, channel == rpchan) + ' ' + _.htmlEscape(message), channel);
  }
},

afterChatMessage: function(source, message, channel) {
  if (!initialized) {
    return;
  }
  if (message.toLowerCase() == "ph'nglui mglw'nafh cthulhu r'lyeh wgah'nagl fhtagn") {
    cthulhu.sendAll("I live once more!", main);
    sys.sendHtmlAll(db.playerToString(source) + " was muted for 5 minutes for summoning the beast!", main);
    mutes.mute("->Cthulhu", sys.ip(source), "summoning the beast", 5);
    sys.sendHtmlAll("<font color=green><timestamp/> -&gt;<i><b>*** Cthulhu</b> returns to its slumber.</i> </font>", main);
  }
},

afterNewMessage: function(message, channel) {
  if (!initialized) {
    return;
  }
  if (message == 'Script Check: OK') {
    this.init();
    var repeat = sys.rand(1, sys.rand(2, 10));
    var index = 0;
    for (var i = 0; i < repeat; i++) {
      index = sys.rand(0, Config.ScriptUpdateMessage.length);
      if (sys.rand(0, 3) == 2) {
        break;
      }
    }
    sys.sendHtmlAll('<font color="blue"><timestamp/></font><b><i><font size="4"><font color="blue">Script Update:</font> ' + Config.scriptUpdateMessage[index] + '</font></i></b>');
    return;
  }
},

beforeBattleMatchup: function(source, target, clauses, rated, mode, sourceteam, targetteam) {
  if (!initialized) {
    return;
  }
  for (var i = 0; i < sys.teamCount(source); i++) {
    tierbot.fixTeam(source, i);
  }
},

afterBattleStarted: function(source, target, clauses, rated, mode, bid, sourceteam, targetteam) {
  if (!initialized) {
    return;
  }
  if (tourbot.mode == 2 && tourbot.areOpponents(source, target) && sys.tier(source, sourceteam) == sys.tier(target, targetteam) && sys.tier(source, teamsource) == tourbot.tier) {
    tourbot.battlesStarted[Math.floor(tourbot.battlers.indexOf(sys.name(source).toLowerCase()) / 2)] = true;
  }
},

afterBattleEnded: function(winner, loser, result, bid) {
  if (!initialized) {
    return;
  }
  if (result == 'tie') {
    return;
  }
  if (juggernaut.isJuggernaut(winner)) {
    juggernaut.jWonAgainst(loser);
  }
  else if (juggernaut.isJuggernaut(loser) || 172800 < juggernaut.lastWon()) {
    juggernaut.newJuggernaut(sys.name(winner));
  }
  tourbot.tourBattleEnd(sys.name(winner), sys.name(loser));
},

beforeChallengeIssued: function(source, target, clauses, rated, mode, sourceteam, tier) {
  if (!initialized) {
    return;
  }
  if (tierbot.beforeChallengeIssued(source, target, clauses, rated, mode, team, tier) {
    sys.stopEvent();
    return;
  }
  if (tourbot.beforeChallengeIssued(source, target, clauses, rated, mode, team, tier) {
    sys.stopEvent();
    return;
  }
},

afterChangeTeam: function(source) {
  if (!initialized) {
    return;
  }
  if (_.infoIsBad(sys.info(source))) {
    sys.kick(source);
    return;
  }
  for (var i = 0; i < sys.teamCount(source); i++) {
    tierbot.fixTeam(source, i);
  }
  var name = sys.name(source);
  if (players[source].oldname != name) {
    if (parseInt(sys.time()) - players[source].lastNameChange < 2) {
      sys.sendMessage('~~Server~~: You can\'t change names that fast.', main);
      sys.kick(source);
      return;
    }
    if (-1 < name.indexOf(Config.clanTag) && -1 == clan.indexInClan(name)) {
      sys.sendMessage('~~Server~~: That name is not registered in the clan.', main);
      sys.kick(source);
      return;
    }
    if (_.nameIsInappropriate(name)) {
      sys.kick(source);
      return;
    }
    players[source].oldname = name;
    players[source].lastNameChange = parseInt(sys.time());
    players[source].htmlname = _.getPlayerHtmlName(source);
    nickbot.sendAll(players[source].oldname + ' is now known as ' + _.playerToString(source), main);
  }
},

afterChangeTier: function(source, team, oldtier, newtier) {
  if (!initialized) {
    return;
  }
  tierbot.fixTeam(source, team);
},

beforePlayerAway: function(source, away) {
  if (!initialized) {
    return;
  }
  if (away && tourbot.isInTourney(sys.name(source))) {
    tourbot.sendMessage(source, 'If you want to idle, /leave the tournament.', main);
    sys.stopEvent();
  }
},

beforePlayerBan: function(source, target) {
  if (!initialized) {
    return;
  }
  if (0 < _.auth(target) || -1 < Config.superUsers.indexOf(sys.name(target))) {
    sys.stopEvent();
  }
},

afterPlayerBan: function(source, target) {
  if (!initialized) {
    return;
  }
  var ids = sys.playerIds();
  for (var i = 0; i < ids.length; i++) {
    if (sys.ip(ids[i]) == sys.ip(target)) {
      sys.kick(ids[i]);
    }
  }
}

});
