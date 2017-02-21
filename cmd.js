const info = require('./cmd/info');
const bundler = require('./cmd/bundle');
const deploy = require('./cmd/deploy');
const release = require('./cmd/release');
const helpers = require('./cmd/helpers');

var args = (JSON.parse(process.env.npm_config_argv)).remain;
var cmd = args[0];
info.log(args);

var site = args[1];

if (!site) {
  info.error('No site specified');
  return;
}

switch(cmd) {
  case 'bundle':
  case 'build':
    bundler(site,false);
    break;

  case 'bundle:dev':
  case 'build:dev':
    bundler(site,true);
    break;

  case 'server-start':
    //TODO
    //'node ./node_modules/http-server/bin/http-server ./dist -p 8888
    //break;
    break;

  case 'deploy':
    const tag = args[2];
    if (!tag) {
      info.error('No tag/version name provided.');
      return;
    }
    deploy(site,tag,false);
    break;

  case 'tag-release':
    release(site,false);
    break;

  default:
    info.log(cmd + ' command not found. Try updating jetpack.');
    info.log('Usage for');
    info.label('npm run jetpack');
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
