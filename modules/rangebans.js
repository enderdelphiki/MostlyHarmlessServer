var banFile = 'rangebans.json';
function RangeBans() {
  _.createFile(banFile, '[]');
  this.bans = _.deserialize(banFile);
}

//  Returns whether a rangeban was successful
RangeBans.prototype.ban = function(ip) {
  var val = _.iptoint(ip);
  if (val < 65536) {
    return false;
  }
  val -= (val % 65536);
  if (-1 < this.bans.indexOf(val)) {
    return false; 
  }
  this.bans.push(val);
  this.bans.sort();
  this.save();
  return true;
};

RangeBans.prototype.clearAll = function() {
  this.bans = [];
  this.save(0);
}

//  Displays all rangebans
RangeBans.prototype.display = function (source, chan, command, commandData, mcmd){
  sys.sendHtmlMessage(source, '<hr>', main);
  if(this.bans.length == 0) {
    sys.sendHtmlMessage(source,'<timestamp/>No Range Bans yet!', main);
  }
  else {
    Guard.sendMessage(source, 'Range Ban List:', main);
    var list = [];
    for (var i = 0; i < this.bans.length; i++) {
      list.push(_.inttoip(this.bans[i]));
    }
    sys.sendMessage(source, list.join(', '), main);
  }
  sys.sendHtmlMessage(source, '<hr>', main);
};

//  Returns if an IP is rangebanned
RangeBans.prototype.isBanned = function(ip) {
  var val = _.iptoint(ip);
  val -= (val % 65536);
  return -1 < this.bans.indexOf(val);
};

//  Writes data to file for persistence
RangeBans.prototype.save = function() {
  _.serialize(banFile, this.bans);
};

//  Returns whether an unban was successful
RangeBans.prototype.unban = function(ip) {
  var val = _.iptoint(ip);
  var i = this.bans.indexOf(val - (val % 65536));
  if (i == -1) {
    return false;
  }
  this.bans.splice(i, 1);
  this.save();
  return true;
};
var rangebans = new RangeBans();

exports.Rangebans = rangebans;
exports.Commands = {
  mod: {
    rblist: {
      params: [],
      description: 'Displays a list of all banned ranges.',
      run: function(source, channel, args) {
        rangebans.display(source);
        return true;
      }
    }
  },
  admin: {
    rb: {
      params: [
        'IP in the form __.__.__.__',
        'reason'
      ],
      description: 'Bans an IP range.',
      run: function(source, channel, args) {
        var ip = args[0];
        if (/\d+.\d+.\d+.\d+/.test(ip)) {
          if (rangebans.ban(ip)) {
            Guard.sendAll('IP ' + ip + ' was rangebanned.');
            var reason = args[1] == undefined ? 'No reason' : args[1];
            logs.log(sys.name(source), 'rb', ip, reason);
            return true;
          }
          Guard.sendMessage(source, 'Failed to ban IP ' + ip + '. Maybe it is already banned?', channel);
          return false;
        }
        CommandBot.sendMessage(source, ip + ' is not a valid IP address.', channel);
        return false;
      }
    },
    unrb: {
      params: ['IP in the form __.__.__.__'],
      description: 'Unbans an IP range.',
      run: function(source, channel, args) {
        if (/\d+.\d+.\d+.\d+/.test(ip)) {
          if (rangebans.unban(args[0])) {
            Guard.sendAll('IP ' + args[0] + ' is no longer rangebaned.');
            return true;
          }
          Guard.sendMessage(source, 'Failed to unban IP. It might not be banned.', channel);
          return false;
        }
        CommandBot.sendMessage(source, ip + ' is not a valid IP address.', channel);
        return false;
      }
    }
  },
  owner: {
    rbclear: {
      params: [],
      description: 'Removes all rangebans.',
      run: function(source, channel, args) {
        rangebans.clearAll();
        Guard.sendAll(_.playerToString(source) + ' cleared all rangebans.');
        return true;
      }
    }
  }
};
