//  Global helper functions
//  Important first, then alphabetical
exports.Helpers = {

  //  Send a message that we want all the staff to see. Good for error handling.
  sendAlert: function(message, e) {
    print(message);
    sys.sendHtmlAll('<ping /><span style="color: red; font-size: 16pt"><timestamp />: ' + message + '</span>', auth);

    if (e) {
      print(message);
      sys.sendAll(e, auth);
    }
  },

  //  Returns a string containing the contents of a file
  getFileContent: function(file) {
    try {
      return sys.getFileContent(file);
    }
    catch (e) {
      _.sendAlert('Unable to read file ' + file, e);
      return '';
    }
  },

  //  Guarantees that a file exists.
  //  param replacement: contents to write if the file did not exist
  createFile: function(file, replacement) {
    sys.appendToFile(file, '');

    if (sys.getFileContent(file) == '') {
      sys.writeToFile(file, replacement);
    }
  },

  //  Returns an Object from a JSON file's contents
  deserialize: function(file, config) {
    try {
      var location = (config ? config : 'json') + '/' + file;
      return JSON.parse(sys.getFileContent(location));
    }
    catch (e) {
      _.sendAlert('Unable to read JSON file ' + file, e);
    }
  },

  //  Writes a JSON object to file
  serialize: function(file, object, config) {
    var location = (config ? config : 'json') + '/' + file;
    sys.writeToFile(location, JSON.stringify(object));
  },

  //  The names PO uses to identify stats when they are abbreviated
  abrStats: ['Atk', 'Def', 'Spd', 'SAtk', 'SDef'],

  //  The list of default colors PO assigns to users without their own colors
  colorList : [
    '#5811b1', '#399bcd', '#0474bb', '#f8760d',
    '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d',
    '#d0990f', '#1b1390', '#028678', '#0324b1'
  ],

  //  Various directories where PO Devs stored game information
  pokeDir: 'db/pokes/',
  moveDir: 'db/moves/6G/',
  abilityDir: 'db/abilities/',
  itemDir: 'db/items/',

  //  The type effectiveness chart, multiplied by 2 (because PO uses it this way)
  typeEffectiveness : [
    [2, 2, 2, 2, 2, 1, 2, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [4, 2, 1, 1, 2, 4, 1, 0, 4, 2, 2, 2, 2, 1, 4, 2, 4, 1, 2],
    [2, 4, 2, 2, 2, 1, 4, 2, 1, 2, 2, 4, 1, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 1, 1, 1, 2, 1, 0, 2, 2, 4, 2, 2, 2, 2, 2, 4, 2],
    [2, 2, 0, 4, 2, 4, 1, 2, 4, 4, 2, 1, 4, 2, 2, 2, 2, 2, 2],
    [2, 1, 4, 2, 1, 2, 4, 2, 1, 4, 2, 2, 2, 2, 4, 2, 2, 2, 2],
    [2, 1, 1, 1, 2, 2, 2, 1, 1, 1, 2, 4, 2, 4, 2, 2, 4, 1, 2],
    [0, 2, 2, 2, 2, 2, 2, 4, 1, 2, 2, 2, 2, 4, 2, 2, 1, 2, 2],
    [2, 2, 2, 2, 2, 4, 2, 2, 1, 1, 1, 2, 1, 2, 4, 2, 2, 4, 2],
    [2, 2, 2, 2, 2, 1, 4, 2, 4, 1, 1, 4, 2, 2, 4, 1, 2, 2, 2],
    [2, 2, 2, 2, 4, 4, 2, 2, 2, 4, 1, 1, 2, 2, 2, 1, 2, 2, 2],
    [2, 2, 1, 1, 4, 4, 1, 2, 1, 1, 4, 1, 2, 2, 2, 1, 2, 2, 2],
    [2, 2, 4, 2, 0, 2, 2, 2, 2, 2, 4, 1, 1, 2, 2, 1, 2, 2, 2],
    [2, 4, 2, 4, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 0, 2, 2],
    [2, 2, 4, 2, 4, 2, 2, 2, 1, 1, 1, 4, 2, 2, 1, 4, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 4, 2, 0, 2],
    [2, 1, 2, 2, 2, 2, 2, 4, 1, 2, 2, 2, 2, 4, 2, 2, 1, 1, 2],
    [2, 4, 2, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 4, 4, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
  ],

  //  A mapping of nature names to the PO-indexed stat raised and lowered
  naturesChart : {
    'Hardy': [0, 0],
    'Bold': [1, 0],
    'Timid': [2, 0],
    'Modest': [3, 0],
    'Calm': [4, 0],
    'Lonely': [0, 1],
    'Docile': [1, 1],
    'Hasty': [2, 1],
    'Mild': [3, 1],
    'Gentle': [4, 1],
    'Brave': [0, 2],
    'Relaxed': [1, 2],
    'Serious': [2, 2],
    'Quiet': [3, 2],
    'Sassy': [4, 2],
    'Adamant': [0, 3],
    'Impish': [1, 3],
    'Jolly': [2, 3],
    'Bashful': [3, 3],
    'Careful': [4, 3],
    'Naughty': [0, 4],
    'Lax': [1, 4],
    'Naive': [2, 4],
    'Rash': [3, 4],
    'Quirky':  [4, 4]
  },

  //  Returns the max auth level of a user.
  //  param string: whether source is an int ID or a string name
  auth: function(source, string) {
    if (!string) {
      source = sys.name(source);
    }
    if (-1 < Config.superUsers.indexOf(source)) {
      return 4;
    }
    return sys.maxAuth(sys.dbIp(source));
  },

  //  Use the official formula to calculate a stat
  calcStat: function(base, iv, ev, level, nature) {
    return Math.floor(Math.floor((iv + (2 * base) + Math.floor(ev / 4)) * level / 100 + 5) * nature);
  },

  //  HP requires a different formula
  calcHP : function (base, iv, ev, level) {
      //  Shedinja
      if (base === 1) {
          return 1;
      }
      return Math.floor((iv + (2 * base) + Math.floor(ev / 4) + 100) * level / 100 + 10);
  },

  //  Returns the color that maps to this channel
  channelColor: function(channel) {
    return Config.channelColors[channel % Config.channelColors.length];
  },

  //  Returns a nice channel formatting
  channelHTML: function(channel) {
    return '<font color="' + _.channelColor(channel) + '">[#' + sys.channel(channel) + ']</font>';
  },

  //  Returns the username without a clan tag given an integer id
  //  param: whether to convert the name to lowercase
  escapeTag: function(source, lower) {
    return _.escapeTagname(sys.name(source), lower);
  },

  //  Returns the username without a clan tag given the name itself
  //  param: whether to convert the name to lowercase
  escapeTagName: function(name, lower) {
    try {
      if (name == undefined) {
        return '';
      }
      if (lower) {
        name = name.toLowerCase();
      }
      return name.replace(/\[[^\]]*\]/gi,'').replace('\'','\\\'');
    }
    catch (e) {
      return '';
    }
  }

  //  Returns an ability's effect
  abilityList: [],
  getAbility: function(abilityID) {
    if (_.abilityList.length == 0) {
      var data = sys.getFileContent(_.moveDir + 'ability_battledesc.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.abilityList[id] = stat;
      }
    }
    return _.abilityList[abilityID];
  },

  //  Returns a berry's effect
  berryList: [],
  getBerry: function(berryID) {
    if (_.berryList.length == 0) {
      var data = sys.getFileContent(_.itemDir + 'berries_description.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.berryList[id] = stat;
      }
    }
    return _.berryList[berryID];
  },

  //  Returns a flung berry's power
  berryPowerList: [],
  getBerryPower: function(berryID) {
    if (_.berryPowerList.length == 0) {
      var data = sys.getFileContent(_.itemDir + 'berry_pow.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.berryPowerList[id] = stat;
      }
    }
    return +_.berryPowerList[berryID] + 20;
  },

  //  Returns a flung berry's type
  berryTypeList: [],
  getBerryType: function(berryID) {
    if (_.berryTypeList.length == 0) {
      var data = sys.getFileContent(_.itemDir + 'berry_type.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.berryTypeList[id] = stat;
      }
    }
    return _.berryTypeList[berryID] ;
  },

  //  Returns a flung item's power
  flingList: [],
  getBerry: function(itemID) {
    if (_.flingList.length == 0) {
      var data = sys.getFileContent(_.itemDir + 'items_pow.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.flingList[id] = stat;
      }
    }
    return _.flingList[itemID];
  },

  //  Returns the ID that the PO Devs assigned for this particular mon and its form
  getDBIndex: function(pokeID) {
    var id = pokeID % 65536;
    var form = (pokeID - id) / 65536;
    return id + ':' + form;
  },

  //  Returns an item's effect
  itemList: [],
  getItem: function(itemID) {
    if (_.itemList.length == 0) {
      var data = sys.getFileContent(_.itemDir + 'items_description.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.itemList[id] = stat;
      }
    }
    return _.itemList[itemID];
  },


  //  Returns the height of a mon
  heightList: [],
  getMonHeight: function(pokeID) {
    if (_.heightList.length == 0) {
      var data = sys.getFileContent(_.pokeDir + 'height.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var height = data[i].substring(index + 1);
        _.heightList[id] = height;
      }
    }
    var key = _.getDBIndex(pokeID);
    if (_.heightList[key] !== undefined) {
      return _.heightList[key];
    }
    var index = key.indexOf(':') + 1;
    var base = key.substring(0, index);
    return _.heightList[base + '0'];
  },

  //  Returns the weight of a mon
  weightList: [],
  getMonWeight: function(pokeID) {
    if (_.weightList.length == 0) {
      var data = sys.getFileContent(_.pokeDir + 'weight.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var weight = data[i].substring(index + 1);
        _.weightList[id] = weight;
      }
    }
    var key = _.getDBIndex(pokeID);
    if (_.weightList[key] !== undefined) {
      return _.weightList[key];
    }
    var index = key.indexOf(':') + 1;
    var base = key.substring(0, index);
    return _.weightList[base + '0'];
  },

  //  Returns the accuracy of a move
  accuracyList: [],
  getMoveAccuracy: function(moveID) {
    if (_.accuracyList.length == 0) {
      var data = sys.getFileContent(_.moveDir + 'accuracy.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.accuracyList[id] = stat;
      }
    }
    var move = _.accuracyList[moveID];
    if (move == '101') {
      return '---';
    }
    return move;
  },

  //  Returns the power of a move
  powerList: [],
  getMoveBasePower: function(moveID) {
    if (_.powerList.length == 0) {
      var data = sys.getFileContent(_.moveDir + 'power.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.powerList[id] = stat;
      }
    }
    var move = _.powerList[moveID];
    if (move === undefined || move === '1') {
      return '---';
    }
    return move;
  },

  //  Returns the move's description
  effectList: [],
  getMoveEffect: function(moveID) {
    if (_.effectList.length == 0) {
      var data = sys.getFileContent(_.moveDir + 'effect.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.effectList[id] = stat;
      }
    }
    var move = _.effectList[moveID];
    if (move === undefined) {
      return 'Deals normal damage.';
    }
    return move.replace(/[\[\]{}]/g, '');
  },

  //  Returns whether a move makes contact
  flagList: [],
  getMoveContact: function(moveID) {
    if (_.flagsList.length == 0) {
      var data = sys.getFileContent(_.moveDir + 'flags.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.flagsList[id] = stat;
      }
    }
    var move = _.flagsList[moveID];
    return move % 2 === 1;
  },

  //  Returns the damage class of a move
  categoryList: [],
  getMoveCategory: function(moveID) {
    if (_.categoryList.length == 0) {
      var data = sys.getFileContent(_.moveDir + 'damage_class.txt').split('\n');

      for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(' ');
        var id = data[i].substr(0, index);
        var stat = data[i].substring(index + 1);
        _.categoryList[id] = stat;
      }
    }
    switch (_.categoryList[moveID]) {
      case 1:
        return 'Physical';
      case 2:
        return 'Special';
      default:
        return 'Status';
    }
  },

  //  Returns the color of a player; use the PO-assigned ones as necessary
  getPlayerColor: function(source) {
    var color = sys.getColor(source);
    if (color == '#000000') {
      return _.colorList[source % _.colorList.length];
    }
    return color;
  },

  getPlayerHtmlName: function(source) {
    var name = sys.name(source);
    if (players[source].seed == 13 || sys.name(source == '[HH]MysteryGift')) {
      //  Rainbow name
      var rainbow = [
        '#FF4444',
        '#FF8844',
        '#FFCC00',
        'green',
        '#4444FF',
        '#CC33FF'
      ];
      var newname = '', offset = Math.floor(Math.random() * 6);
      for (var i = 0; i < sys.name(source.length); i++) {
        newname += 'font color="' + rainbow[(i + offset) % 6] + '">' + name[i] + '</font>';
      }
      return newname;
    }
    else if (players[source].seed == 23) {
      //  'Poisoned' name
      var infectedColors = ['purple', 'green'];
      var newname = '';
      for (var i = 0; i < sys.name(source.length); i++) {
        newname += 'font color="' + infectedColors[(i + offset) % 2] + '">' + name[i] + '</font>';
      }
      return newname;
    }
    else if (Config.htmlNames[name] != undefined) {
      return Config.htmlNames[name];
    }
    return name;
  },

  //  Returns the time as a string. Copied from somewhere. 
  getTimeString: function(sec) {
    var s = [], d = [[604800, 'week'], [86400, 'day'], [3600, 'hour'], [60, 'minute'], [1, 'second']];
    for (var i = 0; i < 5; ++i) {
      var n = parseInt(sec / d[i][0], 10);
      if (0 < n) {
        s.push((n + ' ' + d[i][1] + (1 < n ? 's' : '')));
        sec -= n * d[i][0];
        if (1 < s.length) {
          break;
        }
      }
    }
    return s.join(', ');
  },

  //  Returns a string that will not be captured as HTML code
  //  It also converts links into active URL's.
  htmlEscape: function(text) {
    if (typeof(text) != 'string' || text.length == 0) {
      return '';
    }
    var m = text.toString();
    if (m.length == 0) {
      return '';
    }
    m = m.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
    var words = m.split(' ');
    for (var i = 0; i < words.length; i++) {
      if (8 < words[i].length && (0 == words[i].indexOf('http://') ||  0 == words[i].indexOf('https://'))) {
        words[i] = '<a href="' + words[i].replace('&amp;', '&').replace('&amp;', '&').replace('&amp;', '&') + '">' + words[i] + '</a>';
      }
    }
    return words.join(' ');
  },

  //  Returns the PO/Showdown importable code representing a team.
  //  "Borrowed" from po-devs/po-server-goodies
  importable: function(source, team, compactible) {
    if (compactible === undefined) {
      compactible = false;
    }
    var genders = {
        0: '',
        1: ' (M)',
        2: ' (F)'
      },
      stat = {
          0: 'HP',
          1: 'Atk',
          2: 'Def',
          3: 'SAtk',
          4: 'SDef',
          5: 'Spd'
      }, 
      importable = [];
    for (var i = 0; i < 6; i++) {
      var poke = sys.teamPoke(source, team, i);
      if (poke === undefined || poke === 0) {
        continue;
      }
      importable.push(sys.pokemon(poke) + genders[sys.teamPokeGender(source, team, i)] + " @ " + sys.item(sys.teamPokeItem(source, team, i)));
      importable.push('Trait: ' + sys.ability(sys.teamPokeAbility(source, team, i)));
      var level = sys.teamPokeLevel(source, team, i);
      if (!compactible && level != 100) {
        importable.push('Lvl: ' + level);
      }
      var ivs = [], evs = [], hpinfo = [sys.gen(source, team)];
      for (var j = 0; j < 6; j++) {
        var iv = sys.teamPokeDV(source, team, i, j);
        var ev = sys.teamPokeEV(source, team, i, j);
        if (iv != 31) {
          ivs.push(iv + ' ' + stat[j]);
        }
        if (ev != 0) {
          evs.push(ev + ' ' + stat[j]);
        }
        hpinfo.push(iv);
      }
      if (!compactible && 0 < ivs.length) {
        importable.push('IVs: ' + ivs.join(' / '));
      }
      if (!compactible && 0 < evs.length) {
        importable.push('EVs: ' + evs.join(' / '));
      }
      var nature = sys.teamPokeNature(source, team, i);
      importable.push(sys.nature(nature) + ' Nature (+' + _.statBoostedBy(nature) + ', -' + _.statReducedBy(nature) + ' )');
      for (var j = 0; j < 4; j++) {
        var move = sys.teamPokeMove(source, team, i, j);
        if (move !== undefined) {
          var movestr = sys.move(move);
          if (move == 237) {
            movestr += ' [' + sys.type(sys.hiddenPowerType.apply(sys, hpinfo)) + ']';
          }
          importable.push('- ' + movestr);
        }
      }
      importable.push('');
    }
    return importable;
  },

  //  Returns whether a user's info is illegal
  infoIsBad: function(name) {
    var cyrillic = /\u0430|\u0410|\u0412|\u0435|\u0415|\u041c|\u041d|\u043e|\u041e|\u0440|\u0420|\u0441|\u0421|\u0422|\u0443|\u0445|\u0425|\u0456|\u0406/;
    if (cyrillic.test(name)) {
      return true;
    }
    var greek = /[\u0370-\u03ff]/;
    if (greek.test(name)) {
      return true;
    }
    var dash = /\u058A|\u05BE|\u1400|\u1806|\u2010-\u2015|\u2053|\u207B|\u208B|\u2212|\u2E17|\u2E1A|\u301C|\u3030|\u30A0|[\uFE31-\uFE32]|\uFE58|\uFE63|\uFF0D/;
    if (dash.test(name)) {
      return true;
    }
    if (/[\ufff0-\uffff]/.test(name)) {
      return true;
    }
    //  Swastika
    if (/\u5350/.test(name)) {
      return true;
    }
    // COMBINING OVERLINE
    if (/\u0305|\u0336/.test(name)) {
      return true;
    }
    if (/\u0CBF/gi.test(name)) {
      return true;
    }
    return false;
  },

  //  Convert an integer to an IP
  inttoip: function(num) {
    var d = num % 256;
    for (var i = 3; i > 0; i--,
      num = Math.floor(num / 256),
      d = num % 256 + '.' + d);
    return d;
  },

  //  Convert an IP to an integer. Premature optimization because this needs to be fast
  iptoint: function(ip) {
    var d = ip.split('.');
    return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
  },

  makeLink: function(link, style, label) {
    return '<a href="' + link + '"><font style="' + style + '">' + label + '</font></a>';
  };

  //  Returns whether a name is illegal
  nameIsInappropriate : function (name) {
    if (name == undefined || name.length < 3){
      return true;
    }
    if (name[0] == "-") {
      return true;
    }
    if (-1 < name.indexOf(".com")) {
      return true;
    }
    //  replace commonly replaced letters that trolls attempt to evade censor
    name = name.toLowerCase().replace(/.|,|\s/, '').replace('4', 'a').replace('1', 'l').replace('3', 'e');

    //  Name Blacklist
    for (var i = 0; i < Config.badNames.length; i++) {      
      if (-1 < name.indexOf(Config.badNames[i])) {
        return true;
      }
    }

    var cyrillic = /\u0430|\u0410|\u0412|\u0435|\u0415|\u041c|\u041d|\u043e|\u041e|\u0440|\u0420|\u0441|\u0421|\u0422|\u0443|\u0445|\u0425|\u0456|\u0406/;
    if (cyrillic.test(name)) {
      return true;
    }
    var greek = /[\u0370-\u03ff]/;
    if (greek.test(name)) {
      return true;
    }
    var dash = /\u058A|\u05BE|\u1400|\u1806|\u2010-\u2015|\u2053|\u207B|\u208B|\u2212|\u2E17|\u2E1A|\u301C|\u3030|\u30A0|[\uFE31-\uFE32]|\uFE58|\uFE63|\uFF0D/;
    if (dash.test(name)) {
      return true;
    }
    if (/[\ufff0-\uffff]/.test(name)) {
      return true;
    }
    //  Swastika
    if (/\u5350/.test(name)) {
      return true;
    }
    // COMBINING OVERLINE
    if (/\u0305|\u0336/.test(name)) {
      return true;
    }
    if (/\u0CBF/gi.test(name)) {
      return true;
    }
    return false;
  },

  playerToString: function(source, timestamp, roleplaying, colon, fakename) {
    if (players[source] == undefined) {
      return '~~Unknown Player~~';
    }
    var string = '<font color="' + _.getPlayerColor(source) + '>';
    if (timestamp) {
      string += '<timestamp />';
    }
    string += '<b>';
    if (fakename === undefined || !fakename) {
      if (0 < _.auth(source)) {
        string += (4 == _.auth(source)) ? '<i>~'
          : (-1 < ['[HH]Magnus'].indexOf(sys.name(source))) ? '<<i>♪'
          : '<i>+';
      }
      string += players[source].htmlname;
      if (timestamp || colon) {
        string += ':';
      }
      if (0 < _.auth(source)) {
        string += '</i>';
      }
    }
    else {
      string += '@' + fakename + (timestamp || colon ? ':' : '');
    }
    string += '</b></font>';
    return string;
  },

  //  Send a message to a player
  sendMessage: function(target, message, channel) {
    //  If no channel specified, send to all channels
    if (channel == undefined) {
      sys.sendMessage(target, message);
    }
    else {
      //  If the user is not there, put them there
      if (-1 == sys.playersOfChannel(channel).indexOf(target)) {
        sys.putInChannel(target, channel);
      }
      sys.sendMessage(target, message, channel);
    }
  },

  //  Send an HTML-formatted message to a player
  sendHtmlMessage: function(target, message, channel) {
    if (channel == undefined) {
      sys.sendHtmlMessage(target, message);
    }
    else {
      if (-1 == sys.playersOfChannel(channel).indexOf(target)) {
        sys.putInChannel(target, channel);
      }
      sys.sendMessage(target, message, channel);
    }
  },

  //  Sends a message from someone to everyone.
  sendHtmlAll: function(source, message, channel) {
    //  Just make it look like it worked if the player is confined
    if (players[source].confined) {
      sys.sendHtmlMessage(source, message, channel);
    }
    else {
      sys.sendHtmlAll(message, channel);
    }
  },

  //  Returns the stat a nature will help
  statBoostedBy: function(nature) {
    if (isNaN(nature)) {
      nature = sys.nature(nature);
    }
    return _.abbreviatedStats[_.naturesChart[nature][0]];
  },

  //  Returns the stat a natuer will hinder
  statReducedBy: function(nature) {
    if (isNaN(nature)) {
      nature = sys.nature(nature);
    }
    return _.abbreviatedStats[_.naturesChart[nature][1]];
  },


  //  Battle information is based on bit flags.
  //  There should never be a reason to modify these.
  battleIsSingles: function (mode) { return mode == 0; },
  battleIsDoubles: function (mode) { return mode == 1; },
  battleIsTriples: function (mode) { return mode == 2; },
  usingSleepClause: function (clauses) { return 1 & clauses; },
  usingFreezeClause: function (clauses) { return 2 & clauses; },
  usingDisallowSpectator: function (clauses) { return 4 & clauses; },
  usingItemClause: function (clauses) { return 8 & clauses; },
  usingChallengeCup: function (clauses) { return 16 & clauses; },
  usingNoTimeOut: function (clauses) { return 32 & clauses; },
  usingSpeciesClause: function (clauses) { return 64 & clauses; },
  usingRearrangeTeams: function (clauses) { return 128 & clauses; },
  usingSelfKO: function (clauses) { return 256 & clauses; },
  usingInverted: function (clauses) { return 512 & clauses; }
};
