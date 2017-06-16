const git = require('git-rev');
const globals = require('./globals');
const fs = require('fs');
const info = require('./info');

function Manifest () {
  var site = globals.site();

  var m = {
    'author': null,
    'version': globals.tag(),
    'commit': null,
    'bundle': site + globals.project() + '_bundle_min.js',
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
    //don't copy any master/component info. That is reconstructed on each master build via appendMaster.
    Object.keys(m).forEach(function (key) {
      m[key] = remoteData[key];
    });

    return this;
  }

  function appendMaster (bundle, components) {
    m.master = {
      'bundle': bundle,
      'components': components
    };
  }

  function readLocalFile (onComplete) {
    fs.readFile(globals.workingDir() + '/dist/' + globals.site() + '/release.json', 'utf8', function (err, data) {
      if (err) {
        info.log('No dist manifest found.');
        info.error('You must rebuild the bundle. No build found.');
        process.exit();
      } else if (data) {
        load(JSON.parse(data));
        onComplete();
      }
    });
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
    'appendMaster': appendMaster,
    'load': load,
    'readLocalFile': readLocalFile,
    'write': write,
    'stringify': stringify,
    'data': function data () {
      return m;
    }
  };
}

module.exports = Manifest;

