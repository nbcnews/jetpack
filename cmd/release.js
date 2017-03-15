const info = require('./info');
const helpers = require('./helpers');

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
      helpers.moveReleaseJSToProd(client, tag, site);
    }
  }

  helpers.getReleaseInfo(client, site, tag, doUpload);

};