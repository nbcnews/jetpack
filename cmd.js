const globals = require('./lib/helpers/globals');
const info = require('./lib/helpers/info');
const bundler = require('./cmd/bundle');
const create = require('./cmd/create');
const deploy = require('./cmd/deploy');
const releaser = require('./cmd/release');
const master = require('./cmd/master');
const rollback = require('./cmd/rollback');
const log = require('./cmd/log');
const git = require('./lib/helpers/git-rev');

var args = (JSON.parse(process.env.npm_config_argv)).remain;
var cmd = args[0];

globals.setSite(args[1]);
if (args[2]) {
  globals.setTag(args[2]);
}

if (!globals.site()) {
  info.error('No site specified');
  showHelp();
}

function showHelp () {
  info.log(cmd + ' command not found. Try updating jetpack.');
  info.log('Usage for');
  info.label('npm run jetpack');
  info.log('create [site]: create a new s3 location');
  info.log('bundle [site]: build a site bundle');
  info.log('bundle:dev [site]: build an unminified site bundle with verboses output');
  info.log('build-master [site]');
  info.log('deploy [site]: move a local site bundle to S3');
  info.log('release [site]: put a bundle on S3 into production');

  info.log('rollback [site] [version]: do a release with a previous version');
  info.log('log [site]: look at the release logs');
}

function runWithVersionTag (action) {
  if (globals.tag()) { //explicitly set tag
    action();
    return;
  }

  info.log('No tag/version name provided.');
  git.branch(function (bstr) {
    info.log('Using git branch name: ' + bstr);

    if (bstr === 'master') {
      info.log('Master branch will use the current local tag:');
      git.tag(function (mtag) {
        globals.setTag(mtag);
        info.log(mtag);
        action();
      });
    } else if (cmd === 'release') {
      info.error('You must be on the master branch to do a release.');
    } else {
      globals.setTag(bstr);
      action();
    }
  });
}

switch (cmd) {
  case 'bundle:dev':
  case 'build:dev':
    globals.setDevMode(true);
    runWithVersionTag(bundler);
    break;

  case 'bundle':
  case 'build':
    runWithVersionTag(bundler);
    break;

  case 'build-master':
    master.buildMasterBundle();
    break;

  case 'log':
    log();
    break;

  case 'create':
    create();
    break;

  case 'deploy':
    runWithVersionTag(deploy);
    break;

  case 'release':
    runWithVersionTag(releaser.verifyAndPush);
    break;

  case 'rollback':
    rollback();
    break;

  default:
    showHelp();
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
