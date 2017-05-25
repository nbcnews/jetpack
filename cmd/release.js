const globals = require('../lib/helpers/globals');
const info = require('../lib/helpers/info');
const s3 = require('../lib/helpers/s3Client').default();
const validator = require('../lib/helpers/validation');
var fs = require('fs');
var slackWebHook = require('https');

function lambdaEndpoint() {
  return process.env.PUBLIC_LAMBDA_ENDPOINT + '?bucket=' + process.env.S3_BUCKET + '&bundle=' + s3.remotePath() + '/' + globals.site();
}

function sendReleaseNotifications(manifest) {
  if (!process.env.SLACK_NOTIFY_URL) {
    return;
  }

  var urlstuff = process.env.SLACK_NOTIFY_URL.split('/');
  var host = urlstuff[2];
  var m = manifest.data();

  const postData = {
    text: "Bundle: " + globals.site() + '\n' + m.author + ' released ' + m.version + '\n' + lambdaEndpoint()
  };
  const content = JSON.stringify(postData);

  var options = {
    host: host,
    path: (process.env.SLACK_NOTIFY_URL.split(host))[1],
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(content)
    }
  };

  var req = slackWebHook.request(options, function(res) {
    info.log('Slack notification sent');
    //info.log(res);
  });

  req.on('error', function(e) {
    info.log('problem with request: ' + e.message);
  });
  req.write(content);
  req.end();

}

module.exports = function() {
  validator.dieIfBuildMismatch(function() {
    validator.createAndVerifyManifest(function upload(localManifest) {

      s3.uploadFile(globals.dist() + 'release.json', "release.json", function () {
        info.label('release to: ' + lambdaEndpoint());

        //update log
        s3.getJSONFile('log.json', function onLogLoad(logData) {
          logData.unshift(localManifest.data());
          logData = logData.slice(0, 100);

          fs.writeFile(globals.dist() + 'log.json', JSON.stringify(logData), function (err) {
            if (err) {
              throw err;
            } else {
              s3.uploadFile(globals.dist() + 'release.json', 'release.json', function () {
                info.log('Updated release manifest on S3');
                s3.uploadFile(globals.dist() + 'log.json', 'log.json', function (location) {
                  info.log('Created release log at ' + location);
                  sendReleaseNotifications(localManifest);
                });
              });
            }
          });
        }, function onLogError(err) {
          info.error(err);
        });

      });
    });
  });
};