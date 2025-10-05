const fs = require("fs");
class Log {
  static writeError(message, error) {
    fs.appendFileSync(
      __dirname + "/../logs/errors.txt",
      `${message} ${error.message} - ocurred on ${new Date().toString()}\n`
    );
  }

  static writeInformation(message) {
    fs.appendFileSync(
      __dirname + "/../logs/informations.txt",
      `${message} - ocurred on ${new Date().toString()}\n`
    );
  }
}

module.exports = Log;
