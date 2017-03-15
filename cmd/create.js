const info = require('./info');
const helpers = require('./helpers');

var env = helpers.env();

module.exports = function(site, tag/*, isDev*/) {
  var client = helpers.s3Client();

  if (!client) {
    return;
  }

  //jank
  //upload if we can't download a release.json document from S3, assume we don't have one yet.
  function doUpload(err) {
      if (err) {
        var initialReleaseInfo = {
          "author": 'pre-release',
          "version": 'v0',
          "commit": '',
          "bundle": site + "_bundle_min.js",
          "url":  env.PUBLIC_PATH + site + '/',
          "created": (new Date()).toString()
        };

        helpers.writeReleaseJS(initialReleaseInfo, site);
        helpers.moveReleaseJSToProd(client, tag, site);
      } else {
        info.error('Something unexpected happened.');
        info.error(err);
      }
  }

  helpers.getReleaseInfo(client, site, 'v0', function exists() {
    info.error(site + ' location already exists.');
  }, doUpload);

};