const validator = require('../lib/helpers/validation');
const Manifest = require('../lib/helpers/manifest');
const info = require('../lib/helpers/info');
const globals = require('../lib/helpers/globals');
const s3 = require('../lib/helpers/s3Client').default();
var fs = require('fs');

module.exports = function() {
  validator.ifProjectExists(function onComplete(isExists) {
    if (!isExists) {
      info.log('This appears to be a new site.');
      var starterManifest = Manifest();
      starterManifest.initPrerelease();
      var jsonStr = starterManifest.stringify();
      console.log(jsonStr);

      //create dist folder
      if (!fs.existsSync(globals.dist())){
        fs.mkdirSync(globals.dist());
      }

      fs.writeFile(globals.dist() + 'release.json', jsonStr, function (err) {
        if (err) {
          throw err;
        }
        fs.writeFile(globals.dist() + 'log.json', '[' + jsonStr + ']', function (err) {
          if (err) {
            throw err;
          }
        });

        s3.uploadFile(globals.dist() + 'release.json', 'release.json', function() {
          info.log('Created release manifest on S3');
          s3.uploadFile(globals.dist() + 'log.json',  'log.json', function(location) {
            info.log('Created release log at ' + location);
          });
        });
      });
    } else {
      info.error('Project already exists');
    }
  });
};