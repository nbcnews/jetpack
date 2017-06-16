const globals = require('../lib/helpers/globals');
const info = require('../lib/helpers/info');
const s3 = require('../lib/helpers/s3Client').default();
const validator = require('../lib/helpers/validation');
var fs = require('fs');
var slackNotify = require('../lib/helpers/slackNotify');

function lambdaEndpoint () {
  return process.env.PUBLIC_LAMBDA_ENDPOINT + '?bucket=' + process.env.S3_BUCKET + '&bundle=' + s3.remotePath();
}

function pushRelease (manifest) {
  s3.uploadFile(globals.dist() + 'release.json', 'release.json', function () {
    info.label('release to: ' + lambdaEndpoint());

    //update log
    s3.getJSONFile('log.json', function onLogLoad (logData) {
      logData.unshift(manifest.data());
      logData = logData.slice(0, 100);

      fs.writeFile(globals.dist() + 'log.json', JSON.stringify(logData), function (err) {
        if (err) {
          throw err;
        } else {
          s3.uploadFile(globals.dist() + 'release.json', 'release.json', function () {
            info.log('Updated release manifest on S3');
            s3.uploadFile(globals.dist() + 'log.json', 'log.json', function (location) {
              info.log('Created release log at ' + location);
              slackNotify(manifest, lambdaEndpoint());
            });
          });
        }
      });
    }, function onLogError (err) {
      info.error(err);
    });
  });
}

function verifyAndPush () {
  validator.dieIfBuildMismatch(function () {
    validator.createAndVerifyManifest(function upload (localManifest) {
      pushRelease(localManifest);
    });
  });
}

module.exports = {
  pushRelease,
  verifyAndPush
};
