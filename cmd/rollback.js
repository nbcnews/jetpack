const globals = require('../lib/helpers/globals');
const info = require('../lib/helpers/info');
const s3 = require('../lib/helpers/s3Client').default();
const Manifest = require('../lib/helpers/manifest');
const releaser = require('./release');
const Prompt = require('prompt-text');

module.exports = function () {
  let releaseVer = globals.tag();

  s3.getJSONFile('log.json', function onLogLoad (logData) {
    if (logData.length > 1) {
      if (releaseVer) {
        //make sure version exists
        const releaseIndex = logData.find(function (el) { return el.version === releaseVer; });
        if (!releaseIndex) {
          info.log('WARNING: Previous release not found in log.');
        }
      } else {
        //find previous release
        releaseVer = logData[1].version;
      }

      info.log('Rolling back to version: ' + releaseVer);
      //check that the path exists
      s3.getJSONFile(releaseVer + '/release.json', function onLoad (manifestData) {
        const remoteManifest = Manifest().load(manifestData);
        var text = new Prompt({
          name: 'version',
          message: 'Retype the version number (' + releaseVer + ') to confirm rollback:'
        });
        info.log('');
        text.ask(function (answers) {
          if (answers === releaseVer) {
            remoteManifest.write(); //write to local dist
            releaser.pushRelease(remoteManifest);
            info.log('Rollback confirmed');
          } else {
            info.log('Rollback cancelled');
            return;
          }
        });
      }, function onError (err) {
        info.error('FAILED');
        info.error('most likely the build does not exist');
        info.error(err);
        return;
      });
    } else {
      info.error('Rollback failed. No previous releases found.');
      return;
    }
  }, function onLogError (err) {
    info.error(err);
  });
};
