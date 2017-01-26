const info = require('./lib/info');
const bundler = require('./lib/bundle');
const chalk = require('chalk');

var workingDir = process.env.PWD || __dirname;

//if we are being run as an npm module, then use the parent path instead.
if (__dirname.indexOf('node_modules') !== -1) {
  workingDir = (__dirname.split('/node_modules'))[0];
}

var args = (JSON.parse(process.env.npm_config_argv)).remain;
var cmd = args[0];
info.log(args);

switch(cmd) {
  case 'bundle':
  case 'build':
    bundler(args[1],false);
    break;

  case 'bundle:dev':
  case 'build:dev':
    bundler(args[1],true);
    break;

  case 'server-start':
    //TODO
    //'node ./node_modules/http-server/bin/http-server ./dist -p 8888
    //break;

  default:
    info.log(cmd + ' command not found. Try updating jetpack.');
    info.log('Usage for');
    info.log(chalk.blue('npm run jetpack'));
    info.log('bundle [site] : build a site bundle');
    info.log('bundle:dev [site] : build an unminified site bundle with verboses output');
    break;
}

/**
 We could also do this

 compiler.watch({ // watch options:
  aggregateTimeout: 300, // wait so long for more changes
  poll: true // use polling instead of native watchers
  // pass a number to set the polling interval
}, function(err, stats) {
  // ...
});


 */
