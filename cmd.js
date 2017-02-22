const info = require('./cmd/info');
const bundler = require('./cmd/bundle');
const deploy = require('./cmd/deploy');
const release = require('./cmd/release');
const helpers = require('./cmd/helpers');
const git = require('git-rev');

var args = (JSON.parse(process.env.npm_config_argv)).remain;
var cmd = args[0];
info.log(args);

const site = args[1];
const tag = args[2];

function fetchTag(action) {
  if (!tag) {
    info.log('No tag/version name provided.');
    git.branch(function(str) {
      info.log('Using git branch name: ' + str);
      action(str);
    });
    return;
  }
  action(tag);
}


if (!site) {
  info.error('No site specified');
  return;
}

switch(cmd) {
  case 'bundle':
  case 'build':
    fetchTag(function(tagStr) {
      bundler(site, tagStr, false);
    });
    break;

  case 'bundle:dev':
  case 'build:dev':
    fetchTag(function(tagStr) {
      bundler(site, tagStr, true);
    });
    break;

  case 'deploy':
    fetchTag(function(tagStr) {
      deploy(site, tagStr, true);
    });
    break;

  case 'tag-release':
    fetchTag(function(tagStr) {
      release(site, tagStr, false);
    });
    break;

  default:
    info.log(cmd + ' command not found. Try updating jetpack.');
    info.log('Usage for');
    info.label('npm run jetpack');
    info.log('bundle [site] [tag-name]: build a site bundle');
    info.log('bundle:dev [site] [tag-name]: build an unminified site bundle with verboses output');
    info.log('deploy [site] [tag-name]: move a local site bundle to S3');
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
