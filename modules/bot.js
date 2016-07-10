function Bot(name, color) {
  this.name = name;
  this.color = color;
}

//  Send everyone a message that appears to have come from a bot
Bot.prototype.sendAll = function(target, message, channel) {
  if (channel == undefined) {
    sys.sendHtmlAll(target, '<font style="color:' + this.color + '"><timestamp/>-&gt;<b><i>' + this.name + ':</i></b> ' + message + '</font>');
  }
  else {
    sys.sendHtmlAll(target, '<font style="color:' + this.color + '"><timestamp/>-&gt;<b><i>' + this.name + ':</i></b> ' + message + '</font>', channel);
  }
};

//  Send someone a message that appears to have come from a bot
Bot.prototype.sendMessage = function(target, message, channel) {
  if (channel == undefined) {
    sys.sendHtmlMessage(target, '<font style="color:' + this.color + '"><timestamp/>-&gt;<i><b>' + this.name + '</b> whispered:</i> ' + message + '</font>');
  }
  else {
    sys.sendHtmlMessage(target, '<font style="color:' + this.color + '"><timestamp/>-&gt;<i><b>' + this.name + '</b> whispered:</i> ' + message + '</font>', channel);
  }
};

//  Export the constructor so several bots can be made
exports.Bot = Bot;
