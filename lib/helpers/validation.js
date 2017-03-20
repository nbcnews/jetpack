const globals = require('./globals');
const info = require('./info');
const s3Client = require('./s3Client');
const Manifest = require('./manifest');

function createClient() {
  var client = s3Client(process.env.S3_BUCKET,
    process.env.S3_ACCESS_KEY_ID,
    process.env.S3_SECRET_KEY,
    globals.site());

  return client;
}

function createAndVerifyManifest(onSuccess) {
  function handleError(msg) {
    if (msg) {
      info.error(msg);
    }
    process.exit();
  }

  if (!globals.isDevMode()) {
    var client = createClient();

    var remoteManifest = Manifest();
    var localManifest = Manifest();

    client.getJSONFile('release.json', function(data) {

      remoteManifest.load(data);
      info.log('');
      info.log('Current production release is: ' + remoteManifest.data().version);

      localManifest.refresh(function() {
        if (localManifest.isMatchingVersion(remoteManifest)) {
          handleError('Your tag matches the current release. You must pull a unique release tag name or branch for your bundle.');
        } else {
          onSuccess(localManifest);
        }
      });
    }, handleError);
  }
}

function ifProjectExists(onComplete) {
  var client = createClient();
  client.getJSONFile('release.json', function() {
    onComplete(true);
  }, function(err) {
    if (err.toString().indexOf('404') !== false) {
      onComplete(false);
    } else {
      info.error(err);
      process.exit();
    }
  });
}

module.exports.createAndVerifyManifest = createAndVerifyManifest;
module.exports.ifProjectExists = ifProjectExists;

