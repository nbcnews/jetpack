var chalk = require('chalk');

/**
 * Logging and Console helper
 * Created by j-toddwa on 1/5/17.
 */
exports.record = function(msg) {
  console.log(msg);
};

exports.log = function(msg) {
    console.log(msg);
};

exports.label = function(msg) {
  console.log(chalk.blue(msg));
};

exports.error = function(msg) {
  console.log(chalk.red(msg));
};

exports.progress = function() {
  process.stdout.write(".");
};