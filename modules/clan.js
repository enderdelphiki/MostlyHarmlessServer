var memberFile = 'Members.json';
function Clan() {
  _.createFile(memberFile, '[]');
  this.members = _.deserialize(memberFile);
}

//  Returns whether adding the member was successful
Clan.prototype.addMember = function (source, name) {
  if (name.length < 4 || !/^[A-Za-z0-9 _\!]*$/.test(name)) {
    sys.sendMessage(source, '~~Server~~: Only alphanumeric names can be clan members.', main);
    return false;
  }
  var x = this.indexInClan(name);
  sys.sendMessage(source, '->Debugger: This user is index ' + x, main);
  if (-1 < x) {
    sys.sendMessage(source, '~~Server~~:' + name + ' is already in the member database.', main);
    return false;
  }
  this.members.push(_.escapeTagName(name).toLowerCase());
  this.save();
  sys.sendAll('~~Server~~: ' + name + ' was added to ' + Config.clanTag + '!', main);
  return true;
};

//  Prints the entire clan list to a user
Clan.prototype.exportMembers = function(source, channel) {
  sys.sendMessage(source, this.members, channel);
};

//  Returns the ID location of a name in the clan list
Clan.prototype.indexInClan = function(name) {
  if (0 < sys.dbAuth(name) || 0 < _.auth(sys.id(name))) {
    return true;
  }
  name = _.escapeTagName(name, false).toLowerCase();
  if (name.charAt(0) == ' ') {
    name = name.substring(1, name.length);
  }
  return this.members.indexOf(name);
};

//  Returns whether the removal was successful
Clan.prototype.removeMember = function(source, name) {
  name = _.escapeTagName(name, false).toLowerCase();
  var x = this.indexInClan(name);
  if (-1 == x) {
    sys.sendMessage(source, '~~Server~~:' + name + ' isn't in the member database.', main);
    return false;
  }
  else {
    this.members.splice(x, 1);
  }
  sys.sendAll('~~Server~~: ' + name + ' was removed from the database.', main);
  this.save();
  return true;
};

//  Writes the list to file for persistence
Clan.prototype.save = function() {
  _.serialize(memberFile, this.members);
};

//  Displays all members in the clan.
Clan.prototype.showAll = function(source, chan) {
  this.members = _.getJSON(memberFile);
  if (this.members[0] == undefined) {
    sys.sendMessage(source, '~~Server~~: No members!');
    return;
  }
  this.members = this.members.sort();
  sys.sendMessage(source, '~~Server~~: The ' + this.members.length + ' members are:', chan);
  sys.sendMessage(source, this.members.join(', '), chan);
  this.save();
};

var clan = new Clan();

exports.Clan = clan;
exports.Commands = {
  user: {
    params: [],
    description: 'Provides a list of all registered clan members.',
    run: function(source, channel, args) {
      clan.exportMembers(source, channel);
      return true;
    }
  },
  mod: {
    addmember: {
      params: ['name'],
      description: 'Add a member to the clan list.',
      run: function(source, channel, args) {
        var name = args[0];
        if (name.length < 4 || !/^[A-Za-z0-9 _\!]*$/.test(name)) {
          CommandBot.sendMessage(source, 'That name does not conform to standards.', channel);
          return false;
        }
        clan.addMember(source, name);
        return true;
      }
    }
  }
  admin: {
    delmember: {
      params: ['name'],
      description: 'Remove a member from the clan list.',
      run: function(source, channel, args) {
        clan.removeMember(source, args[0]);
        return true;
      }
    }
  }
};
