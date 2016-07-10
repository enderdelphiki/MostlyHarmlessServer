var muteFile = 'mutes.json';
function Mutes() {
  _.createFile(muteFile, '{}');
  this.muted = _.deserialize(muteFile);
}

//  Deletes all mutes.
Mutes.prototype.clearAll = function() {
  this.muted = [];
  this.save();
}

Mutes.prototype.afterLogIn = function(source) {
  if (this.isMuted(sys.ip(source))) {
    sys.sendMessage(source, '', main);
    ChatBot.sendMessage(source, 'You are muted. Think about your life.', main);
    sys.sendMessage(source, '', main);
    sys.sendAll('Muted player ' + name + ' entered.', watch);
  }
}

//  Displays all mutes, unmuting the expired mutes along the way
Mutes.prototype.display = function(source, chan) {
  sys.sendHtmlMessage(source, '<hr>', chan);
  ChatBot.sendMessage(source, 'Mute List:', chan);
  var string = '<table width="100%"><tr><th width="20%">IP</th><th width="20%">Muter</th><th width="30%">Reason</th><th width="30%">Time</th></tr>';
  var list = [];
  for (var ip in this.muted) {
    if (this.muted[ip] != 0) {
      if (this.muted[ip].time < parseInt(sys.time())) {
        this.unmute(ip);
      }
      else {
        list.push('<tr><td>' + ip + '</td><td>' + this.muted[ip].muter + '</td><td>' + this.muted[ip].reason + '</td><td>' + _.getTimeString(this.muted[ip].time - parseInt(sys.time())) + '</tr>');
      }
    }
  }
  string += list.join() + '</table>';
  sys.sendHtmlMessage(source, string + '</table>', chan);
  sys.sendHtmlMessage(source, '<hr>', chan);
}

//  Returns whether an ip is muted
Mutes.prototype.isMuted = function(ip) {
  if (typeof(this.muted[ip]) != 'object') {
    return false;
  }
  if (this.muted[ip].time < parseInt(sys.time())) {
    this.unmute(ip);
    return false;
  }
  return true;
};

//  Mutes an IP.
Mutes.prototype.mute = function(muter, ip, reason, time) {
  var expire = parseInt(sys.time()) + 60 * time;
  this.muted[ip] = {
    muter: muter,
    reason: reason,
    time: expire
  };
  this.save();
};

//  Tells a user why they are muted
Mutes.prototype.muteMessage = function(source, chan) {
  var ip = sys.ip(source);
  ChatBot.sendMessage(source, 'You are muted. Reason: ' + this.muted[ip].reason + '. Duration: ' + _.getTimeString(this.muted[ip].time - parseInt(sys.time())) + '.', chan);
};

//  Writes data to file for persistence
Mutes.prototype.save = function() {
  _.serialize(mutefile, this.muted);
};

//  Returns whether the unmute was successful
Mutes.prototype.unmute = function(ip) {
  if (typeof(this.muted[ip]) != 'object') {
    return false;
  }
  this.muted[ip] = 0;
  this.save();
  return true;
};

var mutes = new Mutes();
exports.Mutes = mutes;
exports.Commands = {
  mod: {
    mutelist: {
      params: [],
      description: 'Displays a list of all mutes.',
      run: function(source, channel, args) {
        mutes.display(source);
        return true;
      }
    },
    mute: {
      params: [
        'Target\'s name',
        'reason',
        'duration in minutes'
      ],
      description: 'Bans an IP range.',
      run: function(source, channel, args) {
        var name = args[0];
        if (sys.dbIp(name) == undefined) {
          CommandBot.sendMessage(source, 'No player found by the name "' + name + '".', channel);
          return false;
        }
        var target = sys.id(name);
        if (_.auth(source) < _.auth(name, true)) {
          CommandBot.sendMessage(source, 'Insufficient auth.', channel);
          return false;
        }
        var reason = args[1];
        if (reason == undefined || reason.length < 4) {
          CommandBot.sendMessage(source, 'Giving a reason is required.', channel);
          return false;
        }
        var duration = args[2];
        if (duration == undefined || isNaN(duration)) {
          CommandBot.sendMessage(source, 'Must provide a number of minutes for the ban.', channel);
        }
        mutes.mute(sys.name(source), sys.dbIp(name), reason, duration * 60);
        ChatBot.sendAll(_.playerToString(source) + ' muted ' + name + '. Reason: ' + reason + '. Duration: ' + duration + ' minutes.');
        logs.log(sys.name(source), 'mute:' + duration, name, reason);
        return true;
      }
    },
    unmute: {
      params: ['name'],
      description: 'Unmutes a player',
      run: function(source, channel, args) {
        var name = args[0];
        var ip = sys.dbIp(name);
        if (ip == undefined) {
          CommandBot.sendMessage(source, 'No player found by the name "' + name + '".', channel);
          return false;
        }
        if (!mutes.isMuted(ip)) {
          CommandBot.sendMessage(source, name + ' is not muted.', channel);
          return false;
        }
        mutes.unmute(ip);
        ChatBot.sendAll(_.playerToString(source) + ' unmuted ' + name);
        logs.log(sys.name(source), 'unmute', name, 'no reason needed');
        return true;
      }
    }
  },
  admin: {
    clearmutes: {
      params: [],
      description: 'Removes all mutes.',
      run: function(source, channel, args) {
        mutes.clearAll();
        ChatBot.sendAll(_.playerToString(source) + ' cleared all mutes.');
        return true;
      }
    }
  }
};