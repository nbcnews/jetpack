const globals = require('../lib/helpers/globals');
const info = require('../lib/helpers/info');
const s3Client = require('../lib/helpers/s3Client');
const validator = require('../lib/helpers/validation');
var fs = require('fs');

module.exports = function() {
  var client = s3Client(process.env.S3_BUCKET,
    process.env.S3_ACCESS_KEY_ID,
    process.env.S3_SECRET_KEY,
    globals.site());

  //TODO: make sure the bundle has been deployed


  validator.createAndVerifyManifest(function upload(localManifest) {
    client.uploadFile(globals.dist() + 'release.json', globals.site() + "/release.json", function() {
      info.label('release to: ' + process.env['PUBLIC_LAMBDA_ENDPOINT_' + globals.site().toUpperCase()]);

      //update log
      client.getJSONFile('log.json', function onLogLoad(logData) {
        logData.unshift(localManifest.data());
        logData = logData.slice(0,100);

        fs.writeFile(globals.dist() + 'log.json', JSON.stringify(logData), function (err) {
          if (err) {
            throw err;
          } else {
            const s3ReleasePath = globals.site() + '/release.json';
            const s3LogPath = globals.site() + '/log.json';
            client.uploadFile(globals.dist() + 'release.json', s3ReleasePath, function () {
              info.log('Created pre-release manifest on S3');
              client.uploadFile(globals.dist() + 'log.json', s3LogPath, function (location) {
                info.log('Created release log at ' + location);
              });
            });
          }
        });
      }, function onLogError(err){
        info.error(err);
      });

    });
  });
};