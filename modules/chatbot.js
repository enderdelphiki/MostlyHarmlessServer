var chatbot = new Bot('ChatBot', 'Blue');

function ChatBot() {}

//  Inherit the bot's functions
ChatBot.prototype.sendAll = chatbot.sendAll;
ChatBot.prototype.sendMessage = chatbot.sendMessage;

//  Event triggered as someone speaks in chat
ChatBot.beforeChatMessage = function(source, message, channel) {

  //  Check for flooding
  if (_.auth(source) == 0) {
    players[source].floodCount++;
    var time = parseInt(sys.time());

    //  Decay flooding counter to incentivize waiting
    if (players[source].timeCount + 7 < time) {
      var decrease = Math.floor((time - players[source].timeCount) / 7);
      players[source].floodCount -= decrease;
      if (players[source].floodCount < 0) {
        players[source].floodCount = 0;
      }
      players[source].timeCount += decrease * 7;
    }

    if (6 < players[source].floodcount) {
      chatbot.sendAll(_.playerToString(source) + ' was kicked for flooding.');
      sys.kick(source);
      return true;
    }
  }

  //  Check for mutes
  if (channel != elsewhere && mutes.isMuted(sys.ip(source)) && _.auth(source) < 1) {
    mutes.muteMessage(source, main);
    chatbot.sendAll(_.channelToString(chan) + 'Muted Message -- ' + _.playerToString(source, false, false, true) + ' ' + _.htmlEscape(message), watch);
    return true;
  }

  //  Check for long messages
  var limit = 150;
  if (clan.isInClan(sys.name(source))) {
    limit *= 2;
  }
  if (limit < message.length && _.auth(source) < 1) {
    chatbot.sendMessage(source, 'That message is too long. Press \'up\' to fetch it and then break it into parts.', channel);
    channel != elsewhere && chatbot.sendAll(_.channelToString(chan) + 'Long Message by ' + _.playerToString(source), watch);
    return true;
  }

  //  Remove spaces
  var string = message.toLowerCase().replace(/\s/g, '');

  //  Restrict URLs to clan-only
  if (!clan.isInClan(sys.name(source))) {
    var badurls = ['http', 'www.', '.com', '.org', '.net'];
    for (var i = 0; i < badurls.length; i++) {
      if (-1 < string.indexOf(badurls[i])) {
        chatbot.sendMessage(source, 'Only clan members may post links. Ask if an auth will post it for you.', channel);
        channel != elsewhere && chatbot.sendAll(_.channelToString(channel) + 'URL -- ' + _.playerToString(source, false, false, true) + ' ' + _.htmlEscape(string), watch);
        return true;
      }
    }
  }

  //  Make the subtle adjustments people normally make to evade censors
  string = string.replace(/\./g,'').replace(/\-/g,'').replace(/\!/g,'').replace(/\,/g,'').replace(/\*/g,'').replace('0','o');

  //  Check for bad characters
  //  Slower but allows printing of the unicode
  for (var i = 0; i < string.length; i++) {
    var character = string[i];
    if (Config.badCharacters.test(character)) {
      var code = string.charCodeAt(i).toString(16).toUpperCase();
      while (code.length  < 4) {
        code = '0' + code;
      }
      code = '\\u' + code;
      chatbot.sendMessage(source, 'Your message contains the illegal character ' + code + '. If you think this is in error, ask the auth for help.', channel);
      channel != elsewhere && chatbot.sendAll(_.channelToString(channel) + 'Bad Characters -- ' + _.playerToString(false, false, true) + ' ' + code, watch);
    }
    return _.auth(source) < 1;
  }

  if (channel != elsewhere) {
    //  Exception: 'puta' is only bad before removing spaces and other symbols
    var ban;
    if (-1 < message.toLowerCase().indexOf('puta')) {
      ban = 'puta';
    }
    else {
      for (var i = 0; i < Config.badWords.length; i++) {
        var word = Config.badWords[i];
        if (-1 < string.indexOf(word)) {
          ban = word;
          break;
        }
      }
    }
    if (ban) {
      chatbot.sendMessage(source, 'Watch your mouth!', channel);
      chatbot.sendAll(_.channelToString(channel) + 'Censored -- ' + banword + ' in ' + _.playerToString(source, false, false, true) + ' ' + _.htmlEscape(message));
      return true;
    }
  }

  if (db.get('silence') && chan != elsewhere) {
    //  Auth can speak, but warn them each message so silence does not go unnoticed
    chatbot.sendMessage(source, 'A serverwide silence is in effect.', channel);
    chatbot.sendAll(_.channeltoString(channel) + 'Silence -- ' + _.playerToString(source, false, false, true) + ' ' + _.htmlEscape(message), watch);
    return 0 == _.auth(source);
  }

  return false;
};

exports.ChatBot = new ChatBot();
