const info = require('../lib/helpers/info');
const s3 = require('../lib/helpers/s3Client').default();

module.exports = function(onLog) {
    s3.getJSONFile('log.json', function onLogLoad(logData) {
      logData.reverse().forEach(item => {
        info.log(item);
      });
      onLog && onLog(logData);
    }, function onLogError(err) {
      info.error(err);
    });
};