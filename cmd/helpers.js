const info = require('./info');
const git = require('git-rev');
const env = require('lib/helpers/env');

function writeManifest(site, tag) {
  var client = s3Client();

  if (!client) {
    return;
  }

  function writeIt(releaseInfo) {
    if (releaseInfo.version === tag) {
      info.error('Your tag matches the current release. You must choose a unique tag name for your bundle and/or commit a change.');
    } else {
      info.log('creating manifest');
      git.log(function(logarray) {
        var newReleaseInfo = {
          "author": logarray[0][3],
          "version": tag,
          "commit": logarray[0][0],
          "bundle": site + "_bundle_min.js",
          "url":  env.PUBLIC_PATH + site + '/',
          "created": (new Date()).toString()
        };

        writeReleaseJS(newReleaseInfo, site);

      });
    }
  }

  getReleaseInfo(client, site, tag, writeIt);
}

function writeReleaseJS(bodyObj, site) {
  var jsonStr = JSON.stringify(bodyObj, null, 4);
  console.log(jsonStr);

  var fs = require('fs');
  fs.writeFile(env.workingDir + '/dist/' + site + '/release.json', jsonStr, function(err) {
    if (err) {
      throw err;
    }
  });
}

function moveReleaseJSToProd(client, site, tag) {
  info.log('uploading new release.json with ' + tag);

  var params = {
    localFile: env.workingDir + '/dist/' + site + '/release.json',
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
    console.log('release to: ' + env.PUBLIC_LAMBDA_ENDPOINT);
  });
}

exports.getReleaseInfo = getReleaseInfo;
exports.writeManifest = writeManifest;
exports.writeReleaseJS = writeReleaseJS;
exports.moveReleaseJSToProd = moveReleaseJSToProd;
