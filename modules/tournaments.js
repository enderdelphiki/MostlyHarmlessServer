var tourbot = new Bot('Announcer', '#FF00CC');

function Tournaments() {
  this.mode = 0;
}

Tournaments.prototype.sendAll = tourbot.sendAll;
Tournaments.prototype.sendMessage = tourbot.sendMessage;

//  Event triggered when a battle has ended
Tournaments.prototype.afterBattleEnded(winner, loser, result, bid) {
  //  Should never happen in a tournament battle, but you never know
  if (result == 'tie') {
    return;
  }
  var source = sys.name(winner);
  var target = sys.name(loser);
  if (!this.areOpponents(source, target) || !this.ongoingBattle(source)) {
    return;
  }
  this.battlesLost.push(source);
  this.battlesLost.push(target);
  var sourcename = source.toLowerCase();
  var targetname = source.toLowerCase();
  this.battlesStarted.splice(Math.floor(this.battlers.indexOf(sourcename) / 2), 1);
  this.battlers.splice(this.battlers.indexOf(sourcename), 1);
  this.battlers.splice(this.battlers.indexOf(targetname), 1);
  this.members.push(targetname);
  delete this.players[targetname];
  if (this.battlers.length < 2) {
    roundPairing();
    return;
  }
  sys.sendHtmlAll('<hr>', main);
  sys.sendHtmlAll('<b>' + _.playerToString(sys.id(source)) + ' won the battle and advanced to the next round!', main);
  sys.sendHtmlAll('<hr>', main);
};

//  Event triggered after a player logs in
Tournaments.prototype.afterLogIn = function(source) {
  if (this.mode == 1) {
    sys.sendHtmlMessage(source, '<hr>', main);
    TourBot.sendMessage(source, 'A ' + this.tier + ' tournament is in its signup phase.', main);
    CommandBot.sendMessage(source, 'Type !join to enter or !tourrules to see this server\'s Tournament rules.', main);
    TourBot.sendMessage(source, this.tourSpots() + ' spots remaining!', main);
    TierBot.sendMessage(source, 'Prize: ' + prize, main);
    sys.sendHtmlMessage(source, '<hr>', main);
  }
};

//  Returns whether two players are opponents
Tournaments.prototype.areOpponents = function(source, target) {
  var sourcename = sys.name(source);
  var targetname = sys.name(target);
  return this.isInTourney(sourcename) && this.isInTourney(targetname) && this.opponent(sourcename) == targetname.toLowerCase();
};

//  Returns whether to cancel a player going idle
Tournaments.prototype.beforePlayerAway = function(source, away) {
  if (away && this.isInTourney(sys.name(source))) {
    tourbot.sendMessage(source, 'If you want to idle, /leave the tournament.', main);
    return true;
  }
  return false;
};

//  Returns whether a player is currently in the competition
Tournaments.prototype.isInTourney = function(name) {
  if (this.mode == 0) {
    return false;
  }
  return name in this.players;
};

Tournaments.prototype.ongoingBattle = function(name) {
  return this.battlers
}

//  Returns the opponent of a player
Tournaments.prototype.opponent = function(name) {
  name = name.toLowerCase();
  var i = this.battlers.indexOf(name);
  if (x != -1) {
    if (i % 2 == 0) {
      return this.battlers[i + 1];
    }
    return this.battlers[i - 1];
  }
  return '';
};

Tournaments.prototype.roundPairing = function() {
  this.roundNumber += 1;
  this.battlesStarted = [];
  this.battlers = [];
  this.battlesLost = [];
  if (this.members.length == 1) {
    sys.sendHtmlAll('<hr>', main);
    var winner = sys.id(this.players[this.members[0]]);
    sys.sendHtmlAll('<center><font style="color:#FF00CC"><b>And the winner is:</b></font><br>' + _.playerToString(winner) + '<br>Congratuations, ' + this.players[this.members[0]] + '! You won ' + this.prize + '!</center>', main);
    sys.sendHtmlAll('<hr>', main);
    this.mode = 0;
    return;
  }
  var finals = this.members.length == 2;
  if (finals) {
    sys.sendHtmlAll('<center><b><font style="color: #FF00CC">FINALS OF THE ' + this.tier + ' TOURNAMENT</font></b></center>', main);
  }
  else {
    sys.sendHtmlAll('<center><b><font style="color: #FF00CC">Round ' + this.roundNumber + ' of ' + this.tier + ' Tournament</font></b></center>', main);
  }
  var i = 0;
  while (1 < this.members.length) {
    i += 1;

    //  Pick first battler
    var x1 = sys.rand(0, this.members.length);
    this.battlers.push(this.members[x1]);
    var name1 = this.players[this.members[x1]];
    this.members.splice(x1, 1);

    //  Pick second battler
    var x2 = sys.rand(0, this.members.length);
    this.battlers.push(this.members[x2]);
    var name2 = this.players[this.members[x2]];
    this.members.splice(x2, 1);

    this.battlesStarted.push(false);
    sys.sendHtmlAll(_.playerToString(sys.id(name1)) + 'vs ' + _.playerToString(sys.id(name2), main);
  }
};

//  Returns the number of slots remaining
Tournaments.prototype.tourSpots = function() {
  return this.number - this.members.length;
};

exports.Tournaments = new Tournaments();
//  No commands yet; introduce these later
exports.Commands = {

};

