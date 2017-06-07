const globals = require('./globals');
const info = require('./info');
var slackWebHook = require('https');

function sendReleaseNotifications(manifest, url) {
  if (!process.env.SLACK_NOTIFY_URL) {
    return;
  }

  var urlstuff = process.env.SLACK_NOTIFY_URL.split('/');
  var host = urlstuff[2];
  var m = manifest.data();

  const postData = {
    text: "Bundle: " + globals.site() + '\n' + m.author + ' released ' + m.version + '\n' + url
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

module.exports = sendReleaseNotifications;