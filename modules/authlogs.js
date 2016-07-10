var logfile = 'authlogs.json';
function AuthLogs () {
  _.createFile(logfile, '[]');
  this.logs = _.deserialize(logfile);
}

//  Display all the logs
AuthLogs.prototype.display = function(source, chan, num) {
  var table = '<br><table><tr><th style="padding-left:5px;">User</th><th style="padding-left:5px;">Command</th><th style="padding-left:5px;">Target</th><th style="padding-left:5px;">Reason</th></tr>';
  for (var i = this.logs.length - 1; -1 < i && -1 < num; i--) {
    table += '<tr><td>' + this.logs[i][0] + '</td><td>' + this.logs[i][1] + '</td><td>' + this.logs[i][2] + '</td><td>' + this.logs[i][3] + '</td></tr>';
    num--;
  }
  sys.sendHtmlMessage(source, table + '</table><br>', chan);
};

//  Put an entry in the log
AuthLogs.prototype.log = function(source, command, target, reason) {
  this.logs.push([source, command, target, reason]);
  this.save();
};

//  Write the logs to file for persistence
AuthLogs.prototype.save = function() {
  _.serialize(logfile, this.logs);
}

exports.Logs = new AuthLogs();
