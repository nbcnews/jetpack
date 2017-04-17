const globals = require('../lib/helpers/globals');
const info = require('../lib/helpers/info');
const s3Client = require('../lib/helpers/s3Client');
const validator = require('../lib/helpers/validation');

module.exports = function() {
    var client = s3Client(process.env.S3_BUCKET,
      process.env.S3_ACCESS_KEY_ID,
      process.env.S3_SECRET_KEY,
      globals);

    const site = globals.site();
    const tag = globals.tag();
    const localPath = globals.workingDir() + '/dist/' + site;
    const s3Path = site + '/' + tag;

  validator.createAndVerifyManifest(function upload(manifest) {
    client.moveFiles(localPath, s3Path, function(publicPath) {
      info.log(publicPath + '/' + manifest.data().bundle);
    }, function(/*err*/) {
      info.error('deployment error');
    });
  });
};