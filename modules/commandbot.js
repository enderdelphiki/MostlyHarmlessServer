var commandbot = new Bot('Vespiquen', 'orange');

//  Warning that the command does not exist
var badCommandMessage = 'There\'s a time and place for everything. But not now.';

//  Warning that the command was not successful
var failedCommandMessage = 'This isn\'t the time to use that!';

function CommandBot() {
  this.user = {};
  this.mod = {};
  this.admin = {};
  this.owner = {};
  this.hidden = {};
}

//  Event triggered before a chat message is posted, after it is confirmed as a command
CommandBot.prototype.beforeChatMessage = function(source, message, channel) {
  if (channel == elsewhere) {
    commandbot.sendMessage(source, 'Commands are disabled here. This room is intended for serious conversations without moderation.', channel);
    return;
  }
  var name = sys.name(source);

  //  Get command data
  var pos = message.indexOf(' '), args;
  if (pos != -1) {
    command = message.substring(1, pos).toLowerCase();
    var commandData = message.substring(pos + 1);
    while (-1 < commandData.indexOf('::')) {
      commandData = commandData.replace('::', ':');
    }
    args = commandData.split(':');
  }
  else {
    command = message.substring(1).toLowerCase();
    args = [];
  }

  if (this.hidden[command] != undefined) {
    if (!this.hidden[command].run(source, channel, args)) {
      this.sendMessage(source, badCommandMessage, channel);
    }
    return;
  }

  if (this.user[command] != undefined) {
    //  Give PP based on how long it has been since the last command
    var now = parseInt(sys.time());
    if (name == '[HH]HelloSkitty9') {
      players[source].ppleft = players[source].ppMax;
    }
    else {
      var pp = players[source].ppleft;
      var diff = now - players[source].lastCommand;
      if (-1 < sys.name(source).indexOf(Config.clanTag)) {
        diff *= 2;
      }
      if (awards.hasAward(sys.name(source), 'Bug Catcher')) {
        diff *= 2;
      }
      pp += diff / 10;
      players[source].ppleft = Math.min(Math.floor(pp), players[source].ppMax);
    }

    var cost = this.user[command].cost;
    if (awards.hasAward(name, 'Think Fast')) {
      cost = Math.ceiling(cost / 2);
    }
    if (players[source].ppleft < cost) {
      commandbot.sendMessage(source, 'Insufficient PP (' + cost + ' needed and you have ' + players[source].ppleft + '). PP is restored over time without using commands.', channel);
      return;
    }
    if (this.user[command].run(source, channel, args)) {
      players[source].ppleft -= cost;
      return;
    }
    else {
      this.sendMessage(source, failedCommandMessage, channel);
      return;
    }
  }

  var auth = _.auth(source);
  if (0 < auth && this.mod[command] != undefined) {
    if (!this.mod[command].run(source, channel, args)) {
      this.sendMessage(source, failedCommandMessage, channel);
    }
    return;
  }
  if (1 < auth && this.admin[command] != undefined) {
    if (!this.admin[command].run(source, channel, args)) {
      this.sendMessage(source, failedCommandMessage, channel);
    }
    return;
  }
  if (2 < auth && this.owner[command] != undefined) {
    if (!this.owner[command].run(source, channel, args)) {
      this.sendMessage(source, failedCommandMessage, channel);
    }
    return;
  }
  this.sendMessage(source, badCommandMessage, channel);
};

//  Stores commands from an input map; Overwrites collisions
CommandBot.prototype.registerCommandsFrom = function(input) {
  for (var level in input) {
    for (var command in input[level]) {
      this[level][command] = input[level][command];
    }
  }
};

//  Adds commands to the current list
CommandBot.prototype.registerCommandsFromList = function(list) {
  for (var i = 0; i < list.length; i++) {
    this.registerCommandsFrom(list[i]);
  }
};

exports.CommandBot = new CommandBot();
