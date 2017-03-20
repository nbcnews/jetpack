const validator = require('../lib/helpers/validation');
const Manifest = require('../lib/helpers/manifest');
const info = require('../lib/helpers/info');
const globals = require('../lib/helpers/globals');
const s3Client = require('../lib/helpers/s3Client');
var fs = require('fs');

module.exports = function() {
  validator.ifProjectExists(function onComplete(isExists) {
    if (!isExists) {
      info.log('This appears to be a new site.');
      var starterManifest = Manifest();
      starterManifest.initPrerelease();
      var jsonStr = starterManifest.stringify();
      console.log(jsonStr);

      fs.writeFile(globals.dist() + 'release.json', jsonStr, function (err) {
        if (err) {
          throw err;
        }
        fs.writeFile(globals.dist() + 'log.json', '[' + jsonStr + ']', function (err) {
          if (err) {
            throw err;
          }
        });

        var client = s3Client(process.env.S3_BUCKET,
          process.env.S3_ACCESS_KEY_ID,
          process.env.S3_SECRET_KEY,
          globals.site());
        const s3ReleasePath = globals.site() + '/release.json';
        const s3LogPath = globals.site() + '/log.json';

        client.uploadFile(globals.dist() + 'release.json', s3ReleasePath, function() {
          info.log('Created pre-release manifest on S3');
          client.uploadFile(globals.dist() + 'log.json', s3LogPath, function(location) {
            info.log('Created release log at ' + location);
          });
        });
      });
    } else {
      info.error('Project already exists');
    }
  });
};