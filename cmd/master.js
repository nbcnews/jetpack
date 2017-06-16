const globals = require('../lib/helpers/globals');
const info = require('../lib/helpers/info');
const s3Client = require('../lib/helpers/s3Client');
const Manifest = require('../lib/helpers/manifest');
var rp = require('request-promise-native');
const fs = require('fs');

function updateMasterManifest() {
  if (process.env.S3_MASTER_PATH) {
    info.label('**Master bundle build**');
    const masterClient = s3Client(process.env.S3_BUCKET,
        process.env.S3_MASTER_PATH,
        process.env.S3_ACCESS_KEY_ID,
        process.env.S3_SECRET_KEY,
        globals);

    var localManifest = new Manifest();
    var masterManifest = new Manifest();

    var fetchMasterInfo = new Promise((resolve, reject) => {
      masterClient.getJSONFile('release.json', resolve, reject);
    });

    var fetchLocalInfo = new Promise((resolve, reject) => {
      info.log('fetching: local release.json');
      localManifest.readLocalFile(() => resolve(localManifest));
    });

    fetchMasterInfo
      .then((json) => {
        masterManifest.load(json);
      })
      .then(() => {
        return fetchLocalInfo;
      })
      .then(() => {
        var hasThisBundle = false;
        var masterComponents = masterManifest.data().components || [];
        for (var b = 0; b < masterComponents.length; b++) {
          if (masterComponents[b].url === localManifest.url) {
            masterComponents[b] = localManifest;
            hasThisBundle = true;
          }
        }
        if (!hasThisBundle) {
          masterComponents.push(localManifest.data());
        }

        var remoteBundles = masterComponents.map((bund) => {
          return bund.url + bund.version + '/' + bund.bundle;
        });

        const chunkPromises = remoteBundles.map((location) => {
          console.log('fetching component: ' + location);
          return rp(location);
        });

        Promise.all(chunkPromises)
          .then((chunks) => {
            var localMasterFile = globals.workingDir() + '/dist/' + globals.site() + '/master_min.js';
            fs.unlink(localMasterFile, () => {
              chunks.forEach((chunk) => {
                fs.appendFileSync(localMasterFile, chunk, 'utf8');
              });
            });
          })
          .then(() => {
            console.log('done');
          })
          .catch((err) => {
            info.error(err);
            process.exit();
          });
      })
      .catch((err) => {
        info.error('Master build error');
        info.error(err);
        process.exit();
      });
  } else {
    info.log('No S3_MASTER_RELEASE_MANIFEST defined. No bundle merge performed.');
  }
};

module.exports = {
  updateMasterManifest
};
