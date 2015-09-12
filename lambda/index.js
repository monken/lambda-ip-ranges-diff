var Promise = require('bluebird'),
	AWS = require('aws-sdk'),
	_ = require('lodash'),
	request = Promise.promisify(require('request')),
	diff = require('rfc6902-json-diff'),
	util = require('util'),
	s3 = Promise.promisifyAll(new AWS.S3()),
	sns = Promise.promisifyAll(new AWS.SNS({
		region: 'us-east-1',
	}));

var BUCKET = 'ip-ranges-diff',
	PREFIX = 'ranges/';

module.exports.handler = function (event, context) {
	console.log(JSON.stringify(event, null, 2));
	var message, diffDoc;
	Promise.try(function () {
		message = JSON.parse(event.Records[0].Sns.Message);
		return [
			request(message.url).get(0).get('body').then(JSON.parse),
			getLatestRanges().catch(function (e) {
				if (e.code === 'NoSuchKey') return {
					syncToken: 0,
					createDate: '1970-01-01-00-00-00',
				};
				else throw e;
			})];
	}).spread(function (ranges, latest) {
		if (latest.syncToken === message.synctoken)
			throw(util.format('ip-ranges with synctoken %s already processed', message.synctoken));
		if (ranges.syncToken !== message.synctoken)
			throw(util.format('synctoken %s of notification does not match with file', message.synctoken));

		ranges.count = countAddresses(ranges);
		diffDoc = {
			diff: diff(latest, ranges),
			createDate: new Date().toISOString(),
			a: 'https://' + BUCKET + '.s3.amazonaws.com/' + PREFIX + latest.createDate + '-' + latest.syncToken + '.json',
			b: 'https://' + BUCKET + '.s3.amazonaws.com/' + PREFIX + ranges.createDate + '-' + ranges.syncToken + '.json',
		};
		var	body = JSON.stringify(ranges, null, 2);
		return [s3.putObjectAsync({
			Bucket: BUCKET,
			Key: PREFIX + 'latest.json',
			Body: body,
		}), s3.putObjectAsync({
			Bucket: BUCKET,
			Key: PREFIX + ranges.createDate + '-' + ranges.syncToken + '.json',
			Body: body,
		}), s3.putObjectAsync({
			Bucket: BUCKET,
			Key: PREFIX + 'diff-' + ranges.createDate + '-' + ranges.syncToken + '.json',
			Body: JSON.stringify(diffDoc, null, 2),
		})];
	}).then(function () {
		console.log('processed notification with synctoken %s', message.synctoken);
		return sns.publishAsync({
			Message: JSON.stringify(diffDoc, null, 2),
			Subject: 'AWS IP Space Changed',
			TopicArn: 'arn:aws:sns:us-east-1:727601202873:ip-ranges-diff',
		}).then(context.succeed);
	}).catch(function (e) {
		console.error(e);
		context.fail(e);
	});
};

function getLatestRanges() {
	return s3.getObjectAsync({
		Bucket: 'ip-ranges-diff',
		Key: 'ranges/latest.json',
	}).get('Body').call('toString').then(JSON.parse);
}

function countAddresses(ranges) {
	return ranges.prefixes.reduce(function (count, range) {
		var cidr = range.ip_prefix.match(/\/(\d+)$/)[1];
		count[range.service] = count[range.service] || 0;
		count[range.service] += Math.pow(2, 32 - cidr);
		count.TOTAL += Math.pow(2, 32 - cidr);
		return count;
	}, { TOTAL: 0 });
}