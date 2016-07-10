var juggerbot = new Bot('JuggerBaut', '#880000');

var juggerFile = "juggernaut.json";
function Juggernaut() {
  _.createFile(juggerFile,"{}");
  this.jug = _.deserialize(juggerFile);
  if (this.jug.name == undefined) {  
    jug.name = Config.DefaultJuggernaut;
    jug.ips = ["192.168."];
    jug.time = sys.time();
    this.save();
  }
};

//  Inherit the bot's functions
Juggernaut.prototype.sendAll = juggerbot.sendAll;
Juggernaut.prototype.sendMessage = juggerbot.sendMessage;

//  Returns the name of the Juggernaut
Juggernaut.prototype.getName = function() {
  return this.jug.name;
}

//  Returns length the current winning streak
Juggernaut.prototype.getScore = function() {
  //  The Juggernaut's own IP is in the list
  //  However, they had to beat the former Juggernaut
  return this.jug.ips.length;
};

//  Returns if a particular user is the Juggernaut
Juggernaut.prototype.isJuggernaut = function(id) {
  return (sys.name(id).toLowerCase() == this.jug.name.toLowerCase());
};

//  Event triggered when the Juggernaut wins
Juggernaut.prototype.jWonAgainst = function(id) {
  this.jug.time = parseInt(sys.time());
  var separated = sys.ip(id).split('.');
  var ip = separated[0] + '.' + separated[1] + '.';
  
  //  Decide if the person was already battled.
  for (var i = 1; i < this.jug.ips.length; i++) {
    if (this.jug.ips[i] == ip) {
      juggerbot.sendMessage(id, "You lost to " + this.jug.name + " before so no points were awarded.", main);
      juggerbot.sendMessage(sys.id(this.jug.name), "You already won against " + sys.name(id) + " so no points were awarded.", main);
      return;
    }
  }
  this.jug.ips.push(ip);
  var score = this.getScore();
  
  //  Streak messages
  switch (score) {
    case 5:
      juggerbot.sendAll("Winning streak!", main);
      break;
    case 10:
      juggerbot.sendAll(Pictures["planktonwins"], main);
      awards.win(this.jug.name, "Juggernaut");
      break;
    case 15:
      juggerbot.sendAll("Unstoppable!", main);
      break;
    case 20:
      juggerbot.sendAll("Hax God!", main);
      awards.win(this.jug.name, "Elite JN");
      break;
    case 25:
      juggerbot.sendAll(Pictures["completed"], main);
      break;
    case 30:
      juggerbot.sendAll("All our base are belonged to " + this.jug.name + ".", main);
      awards.win(this.jug.name, "Master JN");
      break;
    default:
      if (score > 29 && score % 5 == 0) {
        juggerbot.sendAll("Like no one ever was!", main);
      }
      else {
        juggerbot.sendAll(_.playerToString(sys.id(this.jugname)) + " won against " + _.playerToString(id) + " as the Juggernaut and now has a score of " + score, main);
      }
  }
  this.save();
  Banner.update();
};

//  Returns the time of the last win
Juggernaut.prototype.lastWon = function() {
  return parseInt(sys.time()) - parseInt(this.jug.time);
};

//  Changes the juggernaut
Juggernaut.prototype.newJuggernaut = function(name) {
  this.jug.name = name;
  this.jug.time = parseInt(sys.time());
  var separated = sys.dbIp(name).split('.');
  var ip = separated[0] + '.' + separated[1] + '.';
  this.jug.ips = [ip];
  this.save();
  juggerbot.sendAll(name + " is the new Juggernaut!", main);
  Banner.update();
};

//  Write data to file for persistence
Juggernaut.prototype.save = function() {
  _.serialize(juggerFile, this.jug);
};

var rules = [
  "The rules of the battle do not matter. Every battle with every team against every player in every tier counts toward the Juggernaut game. No excuses. No redoes. Try not to have any regrets.",
  "Forfeiting counts as losing, while ties result in no change.",
  "If you are the Juggernaut and you win a battle, you get a point.",
  "If you are the Juggernaut and you lose a battle, you lose all of your points and the winner of the match becomes the new Juggernaut.",
  "You may only get 1 point per IP range. However, if you lose against a player from whom you have received a point, you still lose your Juggernaut slot.",
  "Accept challenges when you can. If you do not have the time to battle, then you don't become the Juggernaut until you do have time.",
  "If the Juggernaut goes 48 hours without a battle, the Juggernaut status is given away to the winner of the next battle, even if neither player is the Juggernaut.",
  "Don't forget to bring your towel."
];

var juggernaut = new Juggernaut();
exports.Juggernaut = juggernaut;

exports.Commands = {
  user: {
    juggernaut: {
      cost: 0,
      params: [],
      description: 'View the current Juggernaut',
      run: function(source, channel, args) {
        juggerbot.sendMessage(source, juggernaut.getName() + ' is the current Juggernaut with a winning streak of ' + juggernaut.getScore(), channel);
        return true;
      }
    },
    juggernautrules: {
      cost: 0,
      params: [],
      description: 'View the Juggernaut rules.',
      run: function(source, channel, args) {
        juggerbot.endMessage(source, "The Juggernaut rules: ", channel);
        for (var i = 0; i < rules.length; i++) {
          sys.sendMessage(source, i + 1 + '.: ' + rules[i], channel);
        }
        return true;
      }
    }
  },
  mod: {
    newjuggernaut: {
      params: ['name (not yourself'],
      description: 'Assign a new Juggernaut.',
      run: function(source, channel, args) {
        var name = args[0];
        var ip = sys.dbIp(name);
        if (ip == undefined) {
          CommandBot.sendMessage(source, 'No player found by the name "' + name + '".', channel);
          return false;
        }
        if (sys.ip(source) == ip) {
          CommandBot.sendMessage(source, 'Don\'t cheat.', channel);
          return false;
        }
        juggernaut.newJuggernaut(name);
        return true;
      }
    }
  }
};
