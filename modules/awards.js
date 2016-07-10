var awardbot = new Bot('', '#AA0650');

var awardConfig = 'awardconfig.json';
var awardFile = 'awards.json';
function Award() {
  _.createFile(awardConfig, '{}', 'config');
  this.data = _.deserialize(awardConfig);
  _.createFile(awardFile, '{}');
  this.awards = _.deserialize(awardFile);

  //  Redeclare the awards if it has not been made yet
  if (this.awards['Shiny'] == undefined) {
    this.awards = {};
    for (award in this.data) {
      this.awards[award] = [];
    }
    this.save();
  }
}

//  Inherit the bot's functions
Award.prototype.sendAll = awardbot.sendAll;
Award.prototype.sendMessage = awardbot.sendMessage;

//  Returns the number of awards a player has earned
Award.prototype.countAwards = function(player) {
  var i = 0;
  for (x in this.data) {
    if (this.hasAward(player, x)) {
      i++;
    }
  }
  return i;
};

//  Returns whether a player has earned an award
Award.prototype.hasAward = function(name, award) {
  return -1 < this.playerIndex(name, award);
};

//  Find the index of a player in an awards list
//  This is helpful for finding if a player has an award
Award.prototype.playerIndex = function(name, award) {
  return this.awards[award].indexOf(name);
};

//  Write data to file for persistence
Award.prototype.save = function() {
  _.serialize(awardFile, this.awards);
};

//  Send a message to a player
Award.prototype.sendMessage = function(source, message, chan) {
  _.sendBotMessage(source, message, chan, Config.AwardBot[0], Config.AwardBot[1]);
};

//  Send a message to everyone
Award.prototype.sendAll = function(message, chan) {
  _.sendBotAll(message, chan, Config.AwardBot[0], Config.AwardBot[1]);
};

//  Takes an award away from a player
Award.prototype.take = function(source, chan, name, award) {
  var index = this.playerIndex(name, award);
  if (-1 == index) {
    this.sendMessage(source, name + ' doesn\'t have the ' + award + ' Award.', chan);
  }
  else {
    this.awards[award].splice(index, 1);
    this.save();
  }
};

//  View the list of awards
Award.prototype.viewAllAwards = function(source, chan) {
  sys.sendHtmlMessage(source, '<hr>', chan);
  var table = '<table><tr>';
  for (i in this.data) {
    table += '<td>' + Pictures[this.data[i]['badge']] + '<br>' + i + '</td>';
  }
  table += '</tr></table>';
  sys.sendHtmlMessage(source, table, chan);
  this.sendMessage(source, 'Use !myawards to view your awards. Use !awards Name to view information on a specific award.', chan);
  sys.sendHtmlMessage(source, '<hr>', chan);
};

//  Display the winners of an award
Award.prototype.viewAward = function(source, award, chan) {
  sys.sendHtmlMessage(source, '<hr>', chan);
  var color = Config.AwardBot[1];
  this.sendMessage(source, Pictures[this.data[award]['badge']] + '<font size="+4">: ' + award + ' Award</font>', chan);
  sys.sendMessage(source, 'Earned by ' + this.data[award]['by'], chan);
  sys.sendMessage(source, 'Having it will ' + this.data[award]['effect'], chan);
  this.sendMessage(source, 'The following users have won this award:', chan);
  if (this.awards[award].length == 0) {
    sys.sendMessage(source, 'None yet!', chan);
  }
  else {
    sys.sendMessage(source, this.awards[award].join(', '), chan);
  }
  sys.sendHtmlMessage(source, '<hr>', chan);
};

//  Displays the awards earned by a player
Award.prototype.viewOnesAwards = function(source, chan) {
  sys.sendHtmlMessage(source, '<hr>', chan);
  this.sendMessage(source, 'Your awards are:', chan);
  var table = '<table><tr>';
  var name = sys.name(source);
  for (i in this.data) {
    if (this.hasAward(name, i)) {
      table += '<td>' + Pictures[this.data[i]['badge']] + '<br>' + i + '</td>';
    }
  }
  table += '</tr></table>';
  sys.sendHtmlMessage(source, table, chan);
  this.sendMessage(source, 'Use !awards Name to view information on a specific award.', chan);
  sys.sendHtmlMessage(source, '<hr>', chan);    
};

//  Gives a player the specified award
Award.prototype.win = function(name, award) {
  if (this.awards[award] !== undefined && !this.hasAward(name, award)) {
    this.awards[award].push(name);
    this.sendAll(name + ' has earned the ' + award + ' Award! ' + Pictures[this.data[award]['badge']] + ' For more information, use !awards', main);
    this.save();
  }
};

exports.Award = new Award();
exports.Commands = {
  user: {
    awards: {
      params: ['award name (optional)'],
      cost: 0,
      description: 'View data about the awards',
      run: function(source, channel, args) {
        var award = args[0];
        if (award !== undefined) {
          for (key in awards.data) {
            if (key.toLowerCase() == award.toLowerCase()) {
              awards.viewAward(source, key, channel);
              return true;
            }
          }
          awards.sendMessage(source, 'Could not find an award by the name' + award, channel);
          return false;
        }
        awards.viewAllAwards(source, channel);
        return true;
      }
    },
    myawards: {
      params: [],
      cost: 0,
      description: 'View your awards',
      run: funtion(source, channel, args) {
        awards.viewOnesAwards(source, channel);
        return true;
      }
    }
  }
};
