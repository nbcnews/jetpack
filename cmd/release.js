var git = require('git-rev');
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
      info.log('uploading new release.json with ' + tag);
      var params = {
        localFile: helpers.workingDir() + '/dist/' + site + '/release.json',
        s3Params : {
          Bucket: env.S3_BUCKET,
          Key: site + "/release.json"
        }
      };

      var uploader = client.uploadFile(params);
      uploader.on('error', function(err) {
        console.error("unable to upload:", err.stack);
      });
      uploader.on('progress', function() {
        console.log(".", uploader.progressMd5Amount,
          uploader.progressAmount, uploader.progressTotal);
      });
      uploader.on('end', function() {
        console.log("done uploading");
        console.log('release to: https://r3z8wewbv9.execute-api.us-west-2.amazonaws.com/prod/serve');
      });
    }
  }

  helpers.getReleaseInfo(client, site, tag, doUpload);

};