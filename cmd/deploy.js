const info = require('./info');
const helpers = require('./helpers');

var env = helpers.env();

module.exports = function(site, tag, isDev) {
    var client = helpers.s3Client();

    if (!client) {
      return;
    }

    function doUpload(releaseInfo) {
      info.log('current release tag: ' + releaseInfo.version);
      if (releaseInfo.version === tag) {
        info.error('Your tag matches the current release. You must choose a unique tag name for your bundle.');
      } else {

        info.log('uploading to ' + env.PUBLIC_PATH + env.S3_BUCKET + '/' + site + '/' + tag);
        var workingDir = helpers.workingDir();
        var params = {
          localDir: workingDir + '/dist/' + site,
          deleteRemoved: true,
          s3Params: {
            Bucket: env.S3_BUCKET,
            Prefix: site + '/' + tag,
            ACL: 'public-read'
          }
        };

        var up = client.uploadDir(params);
        up.on('error', function(err) {
          info.error("unable to upload:");
          info.error(err.stack);
        });
        up.on('progress', function() {
          info.progress(/*".", up.progressAmount, up.progressTotal*/);
        });
        up.on('end', function(buffer) {
          info.log('done');
        });
      }
    }

    helpers.getReleaseInfo(client, site, tag, doUpload);

};