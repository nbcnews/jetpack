const globals = require('./lib/helpers/globals');
const info = require('./lib/helpers/info');
const bundler = require('./cmd/bundle');
const create = require('./cmd/create');
const deploy = require('./cmd/deploy');
const release = require('./cmd/release');
const log = require('./cmd/log');
const git = require('git-rev');

var args = (JSON.parse(process.env.npm_config_argv)).remain;
var cmd = args[0];

globals.setSite(args[1]);
globals.setTag(args[2]);

if (!globals.site()) {
  info.error('No site specified');
  showHelp();
  return;
}

function showHelp() {
  info.log(cmd + ' command not found. Try updating jetpack.');
  info.log('Usage for');
  info.label('npm run jetpack');
  info.log('create [site]: create a new s3 location');
  info.log('bundle [site]: build a site bundle');
  info.log('bundle:dev [site]: build an unminified site bundle with verboses output');
  info.log('deploy [site]: move a local site bundle to S3');
  info.log('release [site]: put a bundle on S3 into production');
  info.log('log [site]: look at the release logs');
}

function fetchTag(action) {
  if (!globals.tag()) {
    info.log('No tag/version name provided.');
    git.branch(function(str) {
      info.log('Using git branch name: ' + str);

      if (str === 'master') {
        info.log('Master branch will use the current local tag:');
        git.tag(function(mtag) {
          info.log(mtag);
          action(mtag);
        });
        return;
      } else {
        if (cmd === 'release') {
          info.error('You must be on the master branch to do a release.');
          return;
        }
      }

      action(str);
    });
    return;
  }
  action(tag);
}

fetchTag(function(tagStr) {
  globals.setTag(tagStr);

  switch (cmd) {
    case 'bundle':
    case 'build':
      bundler();
      break;

    case 'bundle:dev':
    case 'build:dev':
      globals.setDevMode(true);
      bundler();
      break;

   case 'log':
     log();
     break;

    case 'create':
      create();
      break;

    case 'deploy':
      deploy();
      break;

    case 'release':
      release();
      break;

    default:
      showHelp();
      break;
  }
});

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
