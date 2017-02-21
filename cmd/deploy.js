const env = require('node-env-file');
const info = require('./info');
const s3 = require('s3');

env(process.env.PWD + '/.env');

module.exports = function(site, isDev) {
  var err = null;
  if (typeof process.env.S3_BUCKET === undefined) {
    info.error("S3_BUCKET not defined in .env file.");
    err = true;
  }
  if (typeof process.env.S3_ACCESS_KEY_ID === undefined) {
    info.error("S3_ACCESS_KEY_ID not defined in .env file.");
    err = true;
  }
  if (typeof process.env.S3_SECRET_KEY === undefined) {
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
      Bucket: process.env.S3_BUCKET,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_KEY,
      // any other options are passed to new AWS.S3()
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    },
  });

  info.log("grabbing release.json from : " + process.env.S3_BUCKET + '/' + site);

  var s3Params = {
    Bucket: process.env.S3_BUCKET,
    Key: site + "/release.json"
  };

  var downloader = client.downloadBuffer(s3Params);
  downloader.on('error', function(err) {
    info.error("unable to download:");
    info.error(err.stack);
  });
  downloader.on('progress', function() {
    info.log(".", downloader.progressAmount, downloader.progressTotal);
  });
  downloader.on('end', function(buffer) {
    var releaseInfo = JSON.parse(buffer.toString('ascii'));

    info.log('current tag: ' + releaseInfo.version);
  });


};