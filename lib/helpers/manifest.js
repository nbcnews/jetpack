const git = require('git-rev');
const globals = require('./globals');

function Manifest () {
  var site = globals.site();

  var m = {
    'author': null,
    'version': globals.tag(),
    'commit': null,
    'bundle': site + '_bundle_min.js',
    'url': process.env.PUBLIC_PATH + site + '/',
    'created': (new Date()).toString()
  };

  /* For a new project */
  function initPrerelease () {
    m.author = 'pre-release';
    m.version = 'v0';
  }

  function refresh (onRefresh) {
    git.log(function (logarray) {
      m.author = logarray[0][3];
      m.commit = logarray[0][0];
      m.created = (new Date()).toString();
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    });
  }

  function load (remoteData) {
    Object.keys(remoteData).forEach(function (key) {
      m[key] = remoteData[key];
    });

    return this;
  }

  function write () {
    var jsonStr = stringify();

    var fs = require('fs');
    fs.writeFile(globals.dist() + 'release.json', jsonStr, function (err) {
      if (err) {
        throw err;
      }
    });
  }

  function isMatchingCommit (manifest) {
    var localCommit = m.commit;
    var remoteCommit = manifest.data().commit;

    return (localCommit === remoteCommit);
  }

  function isMatchingVersion (manifest) {
    var localVersion = m.version;
    var remoteVersion = manifest.data().version;

    if (!localVersion) {
      throw new Error(m);
    }
    if (!remoteVersion) {
      throw new Error(remoteVersion);
    }

    return (localVersion === remoteVersion);
  }

  function stringify () {
    return JSON.stringify(m, null, 4);
  }

  return {
    'isMatchingVersion': isMatchingVersion,
    'isMatchingCommit': isMatchingCommit,
    'refresh': refresh,
    'initPrerelease': initPrerelease,
    'load': load,
    'write': write,
    'stringify': stringify,
    'data': function data () {
      return m;
    }
  };
}

module.exports = Manifest;

