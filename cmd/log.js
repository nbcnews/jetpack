const globals = require('../lib/helpers/globals');
const info = require('../lib/helpers/info');
const s3Client = require('../lib/helpers/s3Client');

module.exports = function() {
    var client = s3Client(process.env.S3_BUCKET,
      process.env.S3_ACCESS_KEY_ID,
      process.env.S3_SECRET_KEY,
      globals);

    client.getJSONFile('log.json', function onLogLoad(logData) {
      logData.reverse().forEach(item => {
        info.log(item);
      });
    }, function onLogError(err) {
      info.error(err);
    });
};