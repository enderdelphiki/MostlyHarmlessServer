function Banner() {
  this.count = 0;
}

//  Event triggered every second, but only update every 30.
Banner.prototype.step = function() {
  this.count++;
  if (30 < this.count) {
    this.update();
    this.count = 0;
  }
};

//  Sets the server description
Banner.prototype.setDescription = function() {
  sys.changeDescription(db.get('description'));
};

//  Renders the banner
Banner.prototype.update = function() {
  var linkstyle = db.get('bannerlinkstyle');

  //  Static content: links
  var column1 = '<td width="30%" style="' + db.get('bannercol1style') + '">' + [
    'Check out the ' + _.makeLink(Config.forum, linkstyle, 'Forum'),
    'See ' + _.makeLink('http://www.serebii.net/index2.shtml', linkstyle, 'Serebii') + ' for Pokemon news!',
    'A ' + _.makeLink('https://pokemonshowdown.com/damagecalc/', linkstyle, 'Damage Calc') + ' might help.'
  ].join('<br>') + '</td>';

  //  Dynamic content: set by owner
  var column2 = '<td width="30%" style="' + db.get('bannercol2style') + '">' + db.get('bannermessages').join('<br>') + '</td>';

  var now = new Date();
  var hours = now.getHours(), minutes = now.getMinutes();

  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  var isPM = 11 < hours;
  if (isPM) {
    if (12 < hours) {
      hours -= 12;
    }
  }
  else if (hours == 0) {
    hours = 12;
  }
  var time = hours + ':' + minutes + (isPM ? 'PM' : 'AM');
  var column3 = '<td width="30%" style="' + db.get('bannercol3style') + '">' + [
    'Juggernaut:',
    '<table><tr><td style="text-align: left">' + juggernaut.getName() + '</td><td>' + juggernaut.getScore() + '</td></tr><table>',
    '',
    'Server Time: ' + time
  ].join('<br>') + '</td>';

  var string = '<table width="100%" style="' + db.get('bannerstyle') + '"><tr>' + column1 + column2 + column3 + '</tr></table><br>';
  string += db.get('motd');
  sys.changeAnnouncement(string);
};

exports.Banner = new Banner();
