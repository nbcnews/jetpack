const info = require('./info');
const nodeenv = require('node-env-file');
const git = require('git-rev');

nodeenv(process.env.PWD + '/.env');
const env = process.env;

function workingDir() {
  var workingDir = env.PWD || __dirname;

  //if we are being run as an npm module, then use the parent path instead.
  if (__dirname.indexOf('node_modules') !== -1) {
    workingDir = (__dirname.split('/node_modules'))[0];
  }

  return workingDir;
}

function s3Client() {
  var err = false;

  if (typeof env.S3_BUCKET === undefined) {
    info.error("S3_BUCKET not defined in .env file.");
    err = true;
  }
  if (typeof env.S3_ACCESS_KEY_ID === undefined) {
    info.error("S3_ACCESS_KEY_ID not defined in .env file.");
    err = true;
  }
  if (typeof env.S3_SECRET_KEY === undefined) {
    info.error("S3_SECRET_KEY not defined in .env file.");
    err = true;
  }

  if (err) {
    return;
  }

  var s3 = require('s3');

  var client = s3.createClient({
    maxAsyncS3: 20,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: {
      Bucket: env.S3_BUCKET,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_KEY,
      // any other options are passed to new AWS.S3()
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    }
  });

  return client;
}

function getReleaseInfo(client, site, tag, onReleaseInfo) {
  info.log("grabbing release.json from : " + env.S3_BUCKET + '/' + site);

  var s3Params = {
    Bucket: env.S3_BUCKET,
    Key: site + "/release.json"
  };

  var downloader = client.downloadBuffer(s3Params);
  downloader.on('error', function(err) {
    info.error("unable to download:");
    info.error(err.stack);
  });
  downloader.on('progress', function() {
    info.progress(/*".", downloader.progressAmount, downloader.progressTotal*/);
  });
  downloader.on('end', function(buffer) {
    var releaseInfo = JSON.parse(buffer.toString('ascii'));

    info.log('current release tag: ' + releaseInfo.version);
    if (releaseInfo.version === tag) {
      info.error('Your tag matches the current release. You must choose a unique tag name for your bundle.');
    } else {
      onReleaseInfo(releaseInfo);
    }
  });
}

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

        var jsonStr = JSON.stringify(newReleaseInfo, null, 4);
        console.log(jsonStr);

        var fs = require('fs');
        fs.writeFile(workingDir() + '/dist/' + site + '/release.json', jsonStr, function(err) {
          if (err) {
            throw err;
          }
        });
      });
    }
  }

  getReleaseInfo(client, site, tag, writeIt);
}

exports.env = function() { return env; };
exports.workingDir = workingDir;
exports.s3Client = s3Client;
exports.getReleaseInfo = getReleaseInfo;
exports.writeManifest = writeManifest;