var lambda = require('../index'),
  Promise = require('bluebird');

var test1 = new Promise(function(resolve, reject) {
  lambda.handler({
    Records: [{
      Sns: {
        Message: JSON.stringify({
          "create-time": "2015-09-10T23:22:03+00:00",
          "synctoken": "1441625535",
          "md5": "6b3121c38b57b91c73c62e60c6b49790",
          "url": "https://ip-ranges-diff.s3.amazonaws.com/t/ip-ranges-a.json"
        })
      }
    }]
  }, {
    succeed: resolve,
    fail: reject
  });
});

test1.delay(1000).then(function() {
  return new Promise(function(resolve, reject) {
    lambda.handler({
      Records: [{
        Sns: {
          Message: JSON.stringify({
            "create-time": "2015-09-10T23:22:03+00:00",
            "synctoken": "1441925535",
            "md5": "6b3121c38b57b91c73c62e60c6b49790",
            "url": "https://ip-ranges-diff.s3.amazonaws.com/t/ip-ranges-b.json"
          })
        }
      }]
    }, {
      succeed: resolve,
      fail: reject
    });
  });
});
