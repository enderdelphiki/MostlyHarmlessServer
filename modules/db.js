var dbfile = 'db.json';
function DB () {
  _.createFile(dbfile, '{}');
  this.data = _.deserialize(dbFile);
}

//  Store a key and value pair into the database
DB.prototype.set = function(key, value) {
  this.data[key] = value;
  this.save();
};

//  Returns the value for a given key 
DB.prototype.get = function(key) {
  return this.data[key];
};

//  Produces a default value for a key. Does not overwrite existing values.
DB.prototype.makeKey = function(key, value) {
  if (this.data[key] == undefined) {
    this.data[key] = value;
    this.save();
  }
};

//  Writes the DB to file for persistence
DB.prototype.save = function() {
  _.serialize(dbfile, this.data);
};

//  
DB.prototype.display = function(source, chan) {
  sys.sendHtmlMessage(source, '<hr>', chan);
  var table = '<table width="100%">';
  var odd = true;
  var list = [];
  for (var x in this.data) {
    if (odd) {
      list.push('<tr><td><b>' + x + '</b> : ' + this.data[x] + '</td>');
    }
    else {
      list.push('<td><b>' + x + '</b> : ' + this.data[x] + '</td></tr>');
    }
    odd = !odd;
  }
  table += list.join() + '</table><hr>';
  sys.sendHtmlMessage(source, table, chan);
};

db = new DB();

//  Set the defaults
db.makeKey('unreleasedPokes', []);
db.makeKey('megauser', []);
db.makeKey('partyhost', []);
db.makeKey('ratedbattle', []);
db.makeKey('authnote', '');

db.makeKey('motd', 'Auth can set the message of the day with /motd');
db.makeKey('description', 'Auth can set the description with /desc');
db.makeKey('bannermessages', [
  'Owners can set banner messages',
  'Use /bannermsg 1:your message here',
  'Try not to use more than 3 lines.'
]);
db.makeKey('bannerstyle', 'font-family: Candara; font-size: 14pt; color: white');
db.makeKey('bannerlinkstyle', 'color: orange');
db.makeKey('bannercol1style', 'background-color: #008040');
db.makeKey('bannercol2style', 'background-color: #000000');
db.makeKey('bannercol3style', 'background-color: #004080');

db.makeKey('cmd_attack', true);
db.makeKey('cmd_me', true);
db.makeKey('cmd_meme', true);
db.makeKey('cmd_ping', true);
db.makeKey('cmd_slap', true);
db.makeKey('cmd_status', true);

db.makeKey('party_pew', false);
db.makeKey('party_pig', false);
db.makeKey('party_color', false);
db.makeKey('party_rainbow', false);
db.makeKey('party_reverse', false);

db.makeKey('allowstaffchan', []);
db.makeKey('lockdown', false);
db.makeKey('nowelcome', false);
db.makeKey('notimeout', false);

exports.DB = db;
