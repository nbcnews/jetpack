'use strict';

const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event));

  const params = {
    Bucket: process.env.BUCKET,
    Key: process.env.BUNDLE + '/release.json'
  };

  const done = function(err, loc) {
    console.log(err); callback(null, {
      statusCode: err ? '400' : '302',
      headers: {
        'Location': loc
      },
      body: null
    });
  };

  (function doStuff() {
    s3.getObject(params, (err, data) => {
      if (err) {
        done(err);
      } else {
        const body = data.Body.toString('ascii');
        const manifest = JSON.parse(body);
        done(null, manifest.url + manifest.version + '/' + manifest.bundle);
      }
    });
  })();

};
