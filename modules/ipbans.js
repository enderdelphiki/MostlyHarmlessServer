var ipbanfile = "ipbans.json";
function IPBans() {
  _.createFile(ipbanfile, "[]");
  this.bans = _.deserialize(ipbanfile);
}

//  Returns whether a ban was successful
IPBans.prototype.ban = function(ip) {
  var num = _.iptoint(ip),
    i = this.bans.indexOf(num);
  if (i == -1) {
    this.bans.push(num);
    this.bans.sort();
    this.save();
    return true;
  }
  return false;
};

//  Displays all IP bans
IPBans.prototype.display = function(source) {
  sys.sendHtmlMessage(source, '<hr>', main);
  if (this.bans.length == 0) {
    Guard.sendMessage(source, 'No IP bans yet!', main);
  }
  else {
    Guard.sendMessage(source, 'IP Ban List:', main);
    var list = [];
    for (var i = 0; i < this.bans.length; i++) {
      list.push(_.inttoip(this.bans[i]));
    }
    sys.sendHtmlMessage(source, list.join(', '), main);
  }
  sys.sendHtmlMessage(source, '<hr>', main);
};

//  Returns whether an IP is banned
IPBans.prototype.isBanned = function(ip) {
  return -1 < this.bans.indexOf(_.iptoint(ip));
};

//  Writes the data to file for persistence.
IPBans.prototype.save = function() {
  _.serialize(ipbanfile, this.bans);
};

//  Returns whether an unbanning was successful
IPBans.prototype.unban = function(ip) {
  var val = _.iptoint(ip), i = this.bans.indexOf(val);
  if (i == -1) {
    return false;
  }
  this.bans.splice(i, 1);
  this.save();
  return true;
}
var ipbans = new IPBans();
exports.IPBans = ipbans;
exports.Commands = {
  mod: {
    ipbanlist: {
      params: [],
      description: 'Displays a list of all banned IP\'s.',
      run: function(source, channel, args) {
        ipbans.display(source);
        return true;
      }
    }
  },
  admin: {
    banip: {
      params: [
        'IP in the form __.__.__.__',
        'reason'
      ],
      description: 'Bans an IP address.',
      run: function(source, channel, args) {
        var ip = args[0];
        if (/\d+.\d+.\d+.\d+/.test(ip)) {
          if (ipbans.ban(ip)) {
            Guard.sendAll('IP ' + ip + ' was banned.');
            var reason = args[1] == undefined ? 'No reason' : args[1];
            logs.log(sys.name(source), 'banip', ip, reason);
            return true;
          }
          Guard.sendMessage(source, 'Failed to ban IP ' + ip + '. Maybe it is already banned?', channel);
          return false;
        }
        CommandBot.sendMessage(source, ip + ' is not a valid IP address.', channel);
        return false;
      }
    },
    unbanip: {
      params: ['IP in the form __.__.__.__'],
      description: 'Unbans an IP address.',
      run: function(source, channel, args) {
        if (/\d+.\d+.\d+.\d+/.test(ip)) {
          if (ipbans.unban(args[0])) {
            Guard.sendAll('IP ' + args[0] + ' is no longer baned.');
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
    ipclear: {
      params: [],
      description: 'Removes all IP bans.',
      run: function(source, channel, args) {
        ipbans.clearAll();
        Guard.sendAll(_.playerToString(source) + ' cleared all IP bans.');
        return true;
      }
    }
  }
};