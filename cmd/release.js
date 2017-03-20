const globals = require('../lib/helpers/globals');
const info = require('../lib/helpers/info');
const s3Client = require('../lib/helpers/s3Client');
const validator = require('../lib/helpers/validation');

module.exports = function() {
  var client = s3Client(process.env.S3_BUCKET,
    process.env.S3_ACCESS_KEY_ID,
    process.env.S3_SECRET_KEY,
    globals.site());

  validator.createAndVerifyManifest(function upload(/*localManifest*/) {
    client.uploadFile(globals.dist() + 'release.json', globals.site() + "/release.json", function() {
      info.label('release to: ' + process.env.PUBLIC_LAMBDA_ENDPOINT);
    });
  });
};