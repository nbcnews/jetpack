const globals = require('../lib/helpers/globals');
const info = require('../lib/helpers/info');
const s3 = require('../lib/helpers/s3Client').default();
const validator = require('../lib/helpers/validation');

module.exports = function() {
  validator.dieIfBuildMismatch(function() {

    const site = globals.site();
    const tag = globals.tag();
    const localPath = globals.workingDir() + '/dist/' + site;
    const targetPath = '/' + tag;

    validator.createAndVerifyManifest(function upload(manifest) {
      s3.moveFiles(localPath, targetPath, function (publicPath) {
        info.log(publicPath + '/' + manifest.data().bundle);
      }, function (/*err*/) {
        info.error('deployment error');
      });
    });
  });
};