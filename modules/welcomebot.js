var welcomebot = new Bot('Grocery Store Lady', '#06AA50');
var goodbyebot = new Bot('Officer Peña', 'orange');

//  List of goodbye messages to pick from at random
var goodbyeMessages = [
  "Bye, $, have a beautiful day!",
  "Bye, $, have a great time!",
  "Bye, $, have a wonderful time!",
  "Bye, $, have a beautiful time!",
  "Bye bye, $, see you real soon!"
];

//  List of people who get special welcome messages
var specialWelcome = {
  "[HH]The Professor": "<font style='font-size: 18pt'>Good news, everyone!",
  "[HH]Hazard": "Keep calm. He's here."
};

//  List of people who get special goodbye messages
var specialGoodbye = {
    "[HH]Hallow Primordia": "<font color=black><i>***Hallow falls back into the shadows...***</i></font>"
};

//  List of messages to show on arrival
var welcomeMessage = [
  'The Forum can be found here: <a href="http://w11.zetaboards.com/The_Valley/index/">http://w11.zetaboards.com/The_Valley/index/</a>',
  'The rules are very simple. TLDR: no drama please. Check them with /rules'
  'Don\'t forget to bring your towel!'
];

function WelcomeBot() {}

//  Event triggered when a player enters a channel (except main)
WelcomeBot.prototype.afterChannelJoin = function(source, channel) {
  this.sendWelcomeAll(sys.name(source) + ' entered ' + _.channelToString(channel), channel);
};

//  Event triggered when a player leaves a channel (except main)
WelcomeBot.prototype.afterChannelLeave = function(source, channel) {
  this.sendGoodbyeAll(sys.name(source) + ' left ' + sys.channel(channel), channel);
};

//  Event triggered after a player logs in. It welcomes them and announces their arrival.
WelcomeBot.prototype.afterLogIn = function(source) {
  welcomebot.sendAll('#' + source + ': ' + sys.name(source) + ' (' + sys.ip(source) + ') logged in.', watch);
  sys.sendMessage(source, '');

  //  All players must be in main
  if (!sys.isInChannel(source, main)) {
    sys.putInChannel(source, main);
  }

  //  All auth must be in watch
  if (0 < _.auth(source) && !sys.isInChannel(source, watch)) {
    sys.putInChannel(source, watch);
  }

  for (var i = 0; i < this.welcomeMessage.length; i++) {
    sys.sendMessage(source, welcomeMessage[i], main);
  }

  var rand, name = sys.name(source), max = 4096;
  //  Some people are special and automatically receive fixed names
  if (name == '[HH]Light Corliss') {
    rand = 0;
  }
  else if (name == '[HH]PinkBlaze') {
    rand = 13;
  }
  else if (name == '[HH]Messiah') {
    rand = 23;
  }
  else {
    if (awards.hasAward(name, 'Shiny')) {
      max *= 0.5;   //  min: 2048
    }
    if (awards.hasAward(name, 'Pokerus')) {
      max *= 0.8;   //  min: 1638
    }
    if (awards.hasAward(name, 'Juggernaut')) {
      max *=0.8;    //  min: 1310

      if (awards.hasAward(name, 'Elite JN')) {
        max *= 0.8; //  min: 1048

        if (awards.hasAward(name, 'Master JN')) {
          max *=0.5;//  min: 524
        }
      }
    }
    rand = sys.rand(0, Math.floor(max));
  }
  players[source].seed = rand;
  switch (rand) {
  case 0:
    awards.win(name, 'Inverted');
    break;
  case 13:
    awards.win(name, 'Shiny');
    break;
  case 23:
    awards.win(name, 'Pokerus');
    break;
  }
  welcomebot.sendMessage(source, 'The Message of the Day is: ' + db.get('motd'), main);

  if (!sys.dbRegistered(name)) {
    sys.sendMessage(source, '~~Server~~: Register your name so no one can impersonate you.', main);
  }

  if (-1 < name.toLowerCase().indexOf('ghost') || db.get('nowelcome')) {
    return;
  }

  if (specialWelcome[name] != undefined) {
    welcomebot.sendAll(source, '<font style="color: ' + _.getPlayerColor(source) + '"><b>' + specialWelcome[name] + '</b></font>', channel);
  }
  else {
    var welcome = 'A wild ';
    var num = awards.countAwards(name);
    if (0 < num) {
      welcome += '<font color="#AA0650">[' + num + ']</font>';
    }
    if (rand == 13) {
      welcome += 'shiny ';
    }
    else if (rand == 23) {
      welcome += 'infected ';
    }
    welcome += _.playerToString(source);

    welcomebot.sendAll('<font color="black"><b>' + welcome + ' appeared!</b></font>', main);
  }
};

//  Event triggered after a player logs out
WelcomeBot.prototype.afterLogOut = function(source) {
  goodbyebot.sendAll('#' + source + ': ' + sys.name(source) + ' (' + sys.ip(source) + ') logged out.', watch);
  players[source].online = flase;
  var name = sys.name(source);
  if (-1 < name.toLowerCase().indexOf('ghost') || !players[source].showgoodbye || db.get('nowelcome')) {
    return;
  }
  if (specialGoodbye[name] !== undefined) {
    goodbyebot.sendAll('<font style="color:"' + _.getPlayerColor(source) + '"><b>' + specialGoodbye[name] + '</b></font>', main);
  }
  else {
    goodbyebot.sendAll('<font color="black"><b>' + this.getGoodbyeMessage(_.playerToString(source)) + '</b></font>', main);
  }
};

//  Returns a random Officer Peña message
WelcomeBot.prototype.getGoodbyeMessage = function(name) {
  var i = Math.floor(sys.rand(0, messages.length));
  if (i == 0 && 11 < (new Date()).getHours()) {
    return name + ', have a great night!';
  }
  else {
    return messages[i].replace('$', name);
  }
};


//  Inherit the messages from each bot
WelcomeBot.prototype.sendWelcomeAll = welcomebot.sendAll;
WelcomeBot.prototype.sendWelcomeMessage = welcomebot.sendMessage;
WelcomeBot.prototype.sendGoodbyeAll = goodbyebot.sendAll;
WelcomeBot.prototype.sendGoodbyeMessage = goodbyebot.sendMessage;


exports.WelcomeBot = new WelcomeBot();
