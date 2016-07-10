var tierbot = new Bot('Bloody Tiers', 'red');

var tierData = {
  //  Illegal items
  unobtainableItem: ['Bug Gem', 'Custap Berry', 'Dark Gem', 'Dragon Gem', 'Electric Gem', 'Enigma Berry', 'Fighting Gem', 'Fire Gem',  'Flying Gem', 'Ghost Gem', 'Grass Gem', 'Ground Gem', 'Ice Gem', 'Jaboca Berry', 'Micle Berry', 'Poison Gem', 'Psychic Gem', 'Rock Gem', 'Rowap Berry', 'Steel Gem', 'Water Gem'],

  //  Illegal mons
  unbtainableMons: [],

  //  Mono Color classifications
  Monocolor : {
    'red' : ['Delphox', 'Fletchling', 'Fletchinder', 'Talonflame', 'Tyrantrum', 'Yveltal', 'Charmander', 'Charmeleon', 'Charizard', 'Vileplume', 'Paras', 'Parasect', 'Krabby', 'Kingler', 'Voltorb', 'Electrode', 'Goldeen', 'Seaking', 'Jynx', 'Magikarp', 'Magmar', 'Flareon', 'Ledyba', 'Ledian', 'Ariados', 'Yanma', 'Scizor', 'Slugma', 'Magcargo', 'Octillery', 'Delibird', 'Porygon2', 'Magby', 'Ho-Oh', 'Torchic', 'Combusken', 'Blaziken', 'Wurmple', 'Medicham', 'Carvanha', 'Camerupt', 'Solrock', 'Corphish', 'Crawdaunt', 'Latias', 'Groudon', 'Deoxys', 'Deoxys-A', 'Deoxys-D', 'Deoxys-S', 'Kricketot', 'Kricketune', 'Magmortar', 'Porygon-Z', 'Rotom', 'Rotom-H', 'Rotom-F', 'Rotom-W', 'Rotom-C', 'Rotom-S', 'Tepig', 'Pignite', 'Emboar', 'Pansear', 'Simisear', 'Throh', 'Venipede', 'Scolipede', 'Krookodile', 'Darumaka', 'Darmanitan', 'Dwebble', 'Crustle', 'Scrafty', 'Shelmet', 'Accelgor', 'Druddigon', 'Pawniard', 'Bisharp', 'Braviary', 'Heatmor'],
    'blue' : ['Froakie', 'Frogadier', 'Greninja', 'Inkay', 'Malamar', 'Clauncher', 'Clawitzer', 'Amaura', 'Aurorus', 'Bergmite', 'Avalugg', 'Xerneas', 'Squirtle', 'Wartortle', 'Blastoise', 'Nidoran-F', 'Nidorina', 'Nidoqueen', 'Oddish', 'Gloom', 'Golduck', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Tentacool', 'Tentacruel', 'Tangela', 'Horsea', 'Seadra', 'Gyarados', 'Lapras', 'Vaporeon', 'Omanyte', 'Omastar', 'Articuno', 'Dratini', 'Dragonair', 'Totodile', 'Croconaw', 'Feraligatr', 'Chinchou', 'Lanturn', 'Marill', 'Azumarill', 'Jumpluff', 'Wooper', 'Quagsire', 'Wobbuffet', 'Heracross', 'Kingdra', 'Phanpy', 'Suicune', 'Mudkip', 'Marshtomp', 'Swampert', 'Taillow', 'Swellow', 'Surskit', 'Masquerain', 'Loudred', 'Exploud', 'Azurill', 'Meditite', 'Sharpedo', 'Wailmer', 'Wailord', 'Swablu', 'Altaria', 'Whiscash', 'Chimecho', 'Wynaut', 'Spheal', 'Sealeo', 'Walrein', 'Clamperl', 'Huntail', 'Bagon', 'Salamence', 'Beldum', 'Metang', 'Metagross', 'Regice', 'Latios', 'Kyogre', 'Piplup', 'Prinplup', 'Empoleon', 'Shinx', 'Luxio', 'Luxray', 'Cranidos', 'Rampardos', 'Gible', 'Gabite', 'Garchomp', 'Riolu', 'Lucario', 'Croagunk', 'Toxicroak', 'Finneon', 'Lumineon', 'Mantyke', 'Tangrowth', 'Glaceon', 'Azelf', 'Phione', 'Manaphy', 'Oshawott', 'Dewott', 'Samurott', 'Panpour', 'Simipour', 'Roggenrola', 'Boldore', 'Gigalith', 'Woobat', 'Swoobat', 'Tympole', 'Palpitoad', 'Seismitoad', 'Sawk', 'Tirtouga', 'Carracosta', 'Ducklett', 'Karrablast', 'Eelektrik', 'Eelektross', 'Elgyem', 'Cryogonal', 'Deino', 'Zweilous', 'Hydreigon', 'Cobalion', 'Thundurus', 'Thundurus-T'],
    'green' : ['Chespin', 'QUilladin', 'Chesnaught', 'Hawlucha', 'Zygarde', 'Bulbasaur', 'Ivysaur', 'Venusaur', 'Caterpie', 'Metapod', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Scyther', 'Chikorita', 'Bayleef', 'Meganium', 'Spinarak', 'Natu', 'Xatu', 'Bellossom', 'Politoed', 'Skiploom', 'Larvitar', 'Tyranitar', 'Celebi', 'Treecko', 'Grovyle', 'Sceptile', 'Dustox', 'Lotad', 'Lombre', 'Ludicolo', 'Breloom', 'Electrike', 'Roselia', 'Gulpin', 'Vibrava', 'Flygon', 'Cacnea', 'Cacturne', 'Cradily', 'Kecleon', 'Tropius', 'Rayquaza', 'Turtwig', 'Grotle', 'Torterra', 'Budew', 'Roserade', 'Bronzor', 'Bronzong', 'Carnivine', 'Yanmega', 'Leafeon', 'Shaymin', 'Shaymin-S', 'Snivy', 'Servine', 'Serperior', 'Pansage', 'Simisage', 'Swadloon', 'Cottonee', 'Whimsicott', 'Petilil', 'Lilligant', 'Basculin', 'Maractus', 'Trubbish', 'Garbodor', 'Solosis', 'Duosion', 'Reuniclus', 'Axew', 'Fraxure', 'Golett', 'Golurk', 'Virizion', 'Tornadus', 'Tornadus-T'],
    'yellow' : ['Helioptile', 'Heliolisk', 'Dedenne', 'Kakuna', 'Beedrill', 'Pikachu', 'Raichu', 'Sandshrew', 'Sandslash', 'Ninetales', 'Meowth', 'Persian', 'Psyduck', 'Ponyta', 'Rapidash', 'Drowzee', 'Hypno', 'Exeggutor', 'Electabuzz', 'Jolteon', 'Zapdos', 'Moltres', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Pichu', 'Ampharos', 'Sunkern', 'Sunflora', 'Girafarig', 'Dunsparce', 'Shuckle', 'Elekid', 'Raikou', 'Beautifly', 'Pelipper', 'Ninjask', 'Makuhita', 'Manectric', 'Plusle', 'Minun', 'Numel', 'Lunatone', 'Jirachi', 'Mothim', 'Combee', 'Vespiquen', 'Chingling', 'Electivire', 'Uxie', 'Cresselia', 'Victini', 'Sewaddle', 'Leavanny', 'Scraggy', 'Cofagrigus', 'Archen', 'Archeops', 'Deerling', 'Joltik', 'Galvantula', 'Haxorus', 'Mienfoo', 'Keldeo', 'Keldeo-R'],
    'purple' : ['Goomy', 'Sliggoo', 'Goodra', 'Noibat', 'Noivern', 'Rattata', 'Ekans', 'Arbok', 'Nidoran-M', 'Nidorino', 'Nidoking', 'Zubat', 'Golbat', 'Venonat', 'Venomoth', 'Grimer', 'Muk', 'Shellder', 'Cloyster', 'Gastly', 'Haunter', 'Gengar', 'Koffing', 'Weezing', 'Starmie', 'Ditto', 'Aerodactyl', 'Mewtwo', 'Crobat', 'Aipom', 'Espeon', 'Misdreavus', 'Forretress', 'Gligar', 'Granbull', 'Mantine', 'Tyrogue', 'Cascoon', 'Delcatty', 'Sableye', 'Illumise', 'Swalot', 'Grumpig', 'Lileep', 'Shellos', 'Gastrodon', 'Ambipom', 'Drifloon', 'Drifblim', 'Mismagius', 'Stunky', 'Skuntank', 'Spiritomb', 'Skorupi', 'Drapion', 'Gliscor', 'Palkia', 'Purrloin', 'Liepard', 'Gothita', 'Gothorita', 'Gothitelle', 'Mienshao', 'Genesect'],
    'pink' : ['Spritzee', 'Aromatisse', 'Sylveon', 'Clefairy', 'Clefable', 'Jigglypuff', 'Wigglytuff', 'Slowpoke', 'Slowbro', 'Exeggcute', 'Lickitung', 'Chansey', 'Mr. Mime', 'Porygon', 'Mew', 'Cleffa', 'Igglybuff', 'Flaaffy', 'Hoppip', 'Slowking', 'Snubbull', 'Corsola', 'Smoochum', 'Miltank', 'Blissey', 'Whismur', 'Skitty', 'Milotic', 'Gorebyss', 'Luvdisc', 'Cherubi', 'Cherrim', 'Mime Jr.', 'Happiny', 'Lickilicky', 'Mesprit', 'Munna', 'Musharna', 'Audino', 'Alomomola'],
    'brown' : ['Bunnelby', 'Diggersby', 'Litleo', 'Pyroar', 'Skiddo', 'Gogoat', 'Honedge', 'Doublade', 'Aegislash', 'Binacle', 'Barbaracle', 'Skrelp', 'Dtragalge', 'Tyrunt', 'Phantump', 'Trevenant', 'Pumpkaboo-S', 'Pumpkaboo-L', 'Pumpkaboo-XL', 'Pumpkaboo', 'Gourgeist-S', 'Gourgeist-L', 'Gourgeist-XL', 'Gourgeist', 'Weedle', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Raticate', 'Spearow', 'Fearow', 'Vulpix', 'Diglett', 'Dugtrio', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Abra', 'Kadabra', 'Alakazam', 'Geodude', 'Graveler', 'Golem', 'Farfetch\'d', 'Doduo', 'Dodrio', 'Cubone', 'Marowak', 'Hitmonlee', 'Hitmonchan', 'Kangaskhan', 'Staryu', 'Pinsir', 'Tauros', 'Eevee', 'Kabuto', 'Kabutops', 'Dragonite', 'Sentret', 'Furret', 'Hoothoot', 'Noctowl', 'Sudowoodo', 'Teddiursa', 'Ursaring', 'Swinub', 'Piloswine', 'Stantler', 'Hitmontop', 'Entei', 'Zigzagoon', 'Seedot', 'Nuzleaf', 'Shiftry', 'Shroomish', 'Slakoth', 'Slaking', 'Shedinja', 'Hariyama', 'Torkoal', 'Spinda', 'Trapinch', 'Baltoy', 'Feebas', 'Regirock', 'Chimchar', 'Monferno', 'Infernape', 'Starly', 'Staravia', 'Staraptor', 'Bidoof', 'Bibarel', 'Buizel', 'Floatzel', 'Buneary', 'Lopunny', 'Bonsly', 'Hippopotas', 'Hippowdon', 'Mamoswine', 'Heatran', 'Patrat', 'Watchog', 'Lillipup', 'Conkeldurr', 'Sandile', 'Krokorok', 'Sawsbuck', 'Beheeyem', 'Stunfisk', 'Bouffalant', 'Vullaby', 'Mandibuzz', 'Landorus', 'Landorus-T'],
    'black' : ['Scatterbug', 'Spewpa', 'Vivillon', 'Snorlax', 'Umbreon', 'Murkrow', 'Unown', 'Sneasel', 'Houndour', 'Houndoom', 'Mawile', 'Spoink', 'Seviper', 'Claydol', 'Shuppet', 'Banette', 'Duskull', 'Dusclops', 'Honchkrow', 'Chatot', 'Munchlax', 'Weavile', 'Dusknoir', 'Giratina', 'Darkrai', 'Blitzle', 'Zebstrika', 'Sigilyph', 'Yamask', 'Chandelure', 'Zekrom'],
    'gray' : ['Espurr', 'Carbink', 'Klefki', 'Machop', 'Machoke', 'Machamp', 'Magnemite', 'Magneton', 'Onix', 'Rhyhorn', 'Rhydon', 'Pineco', 'Steelix', 'Qwilfish', 'Remoraid', 'Skarmory', 'Donphan', 'Pupitar', 'Poochyena', 'Mightyena', 'Nincada', 'Nosepass', 'Aron', 'Lairon', 'Aggron', 'Volbeat', 'Barboach', 'Anorith', 'Armaldo', 'Snorunt', 'Glalie', 'Relicanth', 'Registeel', 'Shieldon', 'Bastiodon', 'Burmy', 'Wormadam', 'Wormadam-G', 'Wormadam-S', 'Glameow', 'Purugly', 'Magnezone', 'Rhyperior', 'Probopass', 'Arceus', 'Arceus-Grass', 'Arceus-Fire', 'Arceus-Water', 'Arceus-Poison', 'Arceus-Flying', 'Arceus-Fighting', 'Arceus-Ground', 'Arceus-Rock', 'Arceus-Ice', 'Arceus-Dragon', 'Arceus-Ghost', 'Arceus-Dark', 'Arceus-Steel', 'Arceus-Fairy', 'Arceus-Psychic', 'Arceus-Bug', 'Arceus-Electric', 'Herdier', 'Stoutland', 'Pidove', 'Tranquill', 'Unfezant', 'Drilbur', 'Excadrill', 'Timburr', 'Gurdurr', 'Whirlipede', 'Zorua', 'Zoroark', 'Minccino', 'Cinccino', 'Escavalier', 'Ferroseed', 'Ferrothorn', 'Klink', 'Klang', 'Klinklang', 'Durant', 'Terrakion', 'Kyurem'],
    'white' : ['Floette', 'Florges', 'Floette-Yellow', 'Florges-Yellow', 'Floette-Orange', 'Florges-Orange', 'Floette-Blue', 'Florges-Blue', 'Floette-White', 'Florges-White', 'Pancham', 'Pangoro', 'Furfrou', 'Mewostic', 'Swirlix', 'Slurpuff', 'Butterfree', 'Seel', 'Dewgong', 'Togepi', 'Togetic', 'Mareep', 'Smeargle', 'Lugia', 'Linoone', 'Silcoon', 'Wingull', 'Ralts', 'Kirlia', 'Gardevoir', 'Vigoroth', 'Zangoose', 'Castform', 'Absol', 'Shelgon', 'Pachirisu', 'Snover', 'Abomasnow', 'Togekiss', 'Gallade', 'Froslass', 'Dialga', 'Regigigas', 'Swanna', 'Vanillite', 'Vanillish', 'Vanilluxe', 'Emolga', 'Foongus', 'Amoonguss', 'Frillish', 'Jellicent', 'Tynamo', 'Litwick', 'Lampent', 'Cubchoo', 'Beartic', 'Rufflet', 'Larvesta', 'Volcarona', 'Reshiram', 'Meloetta', 'Meloetta-S']
  },
  
  //  Mono Generation caps
  Monogen: [0, 151, 251, 386, 493, 649, 721]
};

function TierBot() {}

//  Inherit the functions from Bot
TierBot.prototype.sendMessage = tierbot.sendMessage;
TierBot.prototype.sendAll = tierbot.sendAll;

//  Event triggered after a player logs in
TierBot.prototype.afterLogIn = function(source) {
  for (var i = 0; i < sys.teamCount(source), i++) {
    this.fixTeam(source, i);
  }
}

//  Enforces that a player's team is legal.
//  Returns whether the team was moved to a different tier
TierBot.prototype.fixTeam = function(source, team) {
  var tier = sys.tier(source, team);
  if (-1 < tier.indexOf('Challenge Cup') || -1 < tier.indexOf('CC')) {
    return false;
  }
  if (tier == 'Anything Goes') {
    sys.changeTier(source, team, 'Challenge Cup');
    return false;
  }
  if (sys.teamPoke(source, team, 0) == 0) {
    tierbot.sendMessage(source, 'Team ' + (team + 1) + ' has no valid Pokemon and was moved to Challenge Cup.', main);
    sys.changeTier(source, team, 'Challenge Cup');
    return true;
  }
  switch (tier) {
    case 'XY 1v1':
      if (sys.indexOfteamPoke(source, team, 0) != 1) {
        tierbot.sendMessage(source, 'Only one Pokemon is allowed in 1v1.', main);
        sys.changeTier(source, team, 'Challenge Cup');
        return true;
      }
      break;
    case 'Monotype':
      if (!this.isMonotype(source, team)) {
        tierbot.sendMessage(source, 'All Pokemon on your team must share a type in Monotype.', main);
        sys.changeTier(source, team, 'Challenge Cup');
        return true;
      }
      break;
    case 'Monocolor':
      if (!this.isMonocolor(source, team)) {
        sys.changeTier(source, team, 'Challenge Cup');
        return true;
      }
      break;
    case 'XY Little Cup':
      for (var i = 0; i < 6; i++) {
        if (5 < sys.teamPokeLevel(source, team, i)) {
          tierbot.sendMessage(source, 'Pokemon may not be above level 5 in Little Cup.', main);
          sys.changeTier(source, team, 'Challenge Cup');
          return true;
        }
      }
      break;
  }

  //  Don't enforce rules from before gen 6
  if (-1 == ["ORAS NU", "ORAS LU", "ORAS UU", "ORAS OU", "ORAS Uber", "XY No Items", "XY LC", "Pre-PokeBank OU", "XY NU", "XY UU", "XY OU", "XY Ubers", "Monotype", "Monogen", "Inverted Battle", "Sky Battle", "XY 1v1"].indexOf(tier)) {
    return false;
  }

  for (var i = 0; i < 6; i++) {
    var id = sys.teamPoke(source, team, i);
    if (id == 0) {
      break;
    }
    var poke = sys.pokemon(id);
    if (-1 < data.unobtainableMons.indexOf(poke)) {
      tierbot.sendMessage(source, poke + ' is not available in Generation 6 games and is banned from all teams.', main);
      sys.changeTier(source, team, 'Challenge Cup');
      return true;
    }
    var item = sys.item(sys.teamPokeItem(source, team, i));
    if (-1 < data.unobtainableItems.indexOf(item)) {
      tierbot.sendMessage(source, item + ' is not available in Generation 6 games and is banned from all teams.', main);
      sys.changeTier(source, team, 'Challenge Cup');
      return true;
    }
  }
}

//  Returns whether a player's team is legal for monotype
TierBot.prototype.isMonotype = function(source, team) {
  var type1 = sys.pokeType1(sys.teamPoke(source, team, 0));
  var type2 = sys.pokeType2(sys.teamPoke(source, team, 0));
  var use1 = type1 != 18, use2 = type2 != 18;

  for (var i = 1; i < 6 && (use1 || use2); i++) {
    var poke = sys.teamPoke(source, team, i);
    if (use1 && (sys.pokeType1(poke) != type1 || sys.pokeType2(poke) != type1)) {
      use1 = false;
    }
    if (use2 && (sys.pokeType1(poke) != type2 || sys.pokeType2(poke) != type2)) {
      use2 = false;
    }
  }
  return use1 || use2;
};

//  Returns whether a player's team is legel for monocolor
TierBot.prototype.isMonocolor = function(source, team) {
  var poke = sys.pokemon(sys.teamPoke(source, team, 0)), color, list;

  for (var key in data.Monocolor) {
    if (-1 < data.Monocolor[key].indexOf(poke)) {
      list = data.Monocolor[key];
      color = key;
    }
  }
  if (color == undefined) {
    tierbot.sendMessage(source, poke + ' has no known color.', main);
    return false;
  }

  for (var i = 1; i < 6; i++) {
    poke = sys.pokemon(sys.teamPoke(source, team, i));
    if (-1 < list.indexOf(poke)) {
      tierbot.sendMessage(source, poke + ' is not ' + color, main);
      return false;
    }
  }
  return true;
};

exports.TierBot = new TierBot();
