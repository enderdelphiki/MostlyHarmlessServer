function Tumbleweed() {
  this.count = 360;
}

//  Event triggered when a player speaks
Tumbleweed.prototype.beforeChatMessage = function(source, message, channel) {
  //  Think Fast game
  if (495 < this.count && this.count < 505) {
    awards.win(sys.name(source), 'Think Fast');
  }

  //  Zombie game
  else if (590 < this.count && this.count < 650) {
    players[source].zp++;
    sys.sendHtmlAll('<timestamp/> -&gt; <i><b>Scorekeeper:</b> **Boom! Headshot!**</i> ' + _.playerToString(source) + '\'s score is ' + players[source].zp, main);
    if (10 <= players[source].zp) {
      awards.win(sys.name(source), 'Hell\'s Janitor');
    }
  }
}

//  Posts a particular message into chat
Tumbleweed.prototype.post = function(i) {
  if (tumbleweedMessages.length <= i) {
    var message = tumbleweedMessages[i];
    sys.sendHtmlAll('<font color="' + message[0] + '"><timestamp /> -&gt; <i><b>' + message[1] + ':</b></i></font><i> **' + message[2] + '**</i>', main);
  }
};

//  Event triggered every second
Tumbleweed.prototype.step = function() {
  this.count--;

  //  Zombie game
  if (600 == this.count) {
    sys.sendHtmlAll('<timestamp /> -&gt; <i><b>:Zombie:</b> **hrrhaaannnnnng!**</i>');
    this.count = 360;
    return;
  }

  //  Think Fast game; Must reset counter twice due to race condition
  if (500 == this.count) {
    this.count = 360;
    awards.sendAll('<i>Time\'s up!');
    this.count = 360;
  }

  if (0 == this.count) {
    var rand = sys.rand(0, 50);
    //  10% chance of Think Fast
    if (45 < r) {
      awards.sendAll('<i>**Think fast!**</i>');
      this.count = 502;
    }

    //  10% chance of Zombie
    else if (40 < r) {
      sys.sendHtmlAll('<timestamp/> -&gt; <i><b>Zombie:</b> **hnnnnng...gruuhhhhhhhh**</i>');
      this.count = 610;
    }

    //  Regular tumbleweed message
    else if (r < this.data.display.length) {
      this.post(rand);
      this.count = 360;
    }

    //  Chance of waiting another round
    else {
      this.count = 360;
    }
  }
};

exports.Tumbleweed = new Tumbleweed();

var tumbleweedMessages = [
  [
    "#FF00CC",
    "Battlefront",
    "executes Operation High Tension Syndrome"
  ],
  [
    "#FF0000", 
    "Santa Claus",
    "checks list twice"
  ],
  [
    "#FF0000",
    "Kricketot",
    "chirp chirp"
  ],
  [
    "green",
    "Tumbleweed",
    "flies by"
  ],
  [
    "green",
    "Grass",
    "grows"
  ],
  [
    "#00FF00",
    "CC",
    "pizza..."
  ],
  [
    "#0000AA",
    "A wild Zubat",
    "appears"
  ],
  [
    "#0000AA",
    "Music Box",
    "stops playing"
  ],
  [
    "purple",
    "Butterfly",
    "causes a dramatic turn of events"
  ],
  [
    "purple",
    "Homura",
    "kills Kyubey"
  ],
  [
    "brown",
    "Frodo",
    "simply walks into Mordor"
  ],
  [
    "black",
    "Jigglypuff",
    "sings"
  ],
  [
    "#BBBBBB",
    "Guard Skill",
    "delay"
  ],
  [
    "black",
    "Mayuri",
    "Too-Too-Roo!"
  ],
  [
    "green",
    "Chandler",
    "quits gym"
  ],
  [
    "red",
    "Entropy",
    "diminishes"
  ],
  [
    "red", 
    "Kool-Aid Guy",
    "<b>OH YEAH!</b>"
  ],
  [
    "black",
    "Inigo Montoya",
    "You killed my father. Prepare to die."
  ],
  [
    "orange",
    "~~Server~~",
    "used splash"
  ],
  [
    "red",
    "Metropolis",
    "watches and thoughtfully smiles"
  ],
  [
    "green",
    "Curiosity",
    "kills the chat"
  ],
  [
    "blue",
    "Boomerang",
    "comes back"
  ],
  [
    "green",
    "A Tree",
    "Help, I've fallen and I can't get up!"
  ]
];