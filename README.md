## AWS IP Addresses Diff Notification

Amazon Web Services (AWS) publishes its current IP address ranges in JSON format. However, a diff that provides the changes is not readily available. Subscribe to `arn:aws:sns:us-east-1:727601202873:ip-ranges-diff` to get notified about *what* changed in the latest AWS IP address ranges.

Additionally, this version of the `ip-ranges.json` file is updated with the total number of IP addresses used by each AWS service:

```javascript
// https://ip-ranges-diff.s3.amazonaws.com/ranges/2015-09-11-21-22-03-1442004734.json
...
"count": {
  "TOTAL": 27601856,
  "AMAZON": 13877536,
  "EC2": 13459104,
  "ROUTE53": 2048,
  "ROUTE53_HEALTHCHECKS": 1024,
  "CLOUDFRONT": 262144
}
...
```

## AWS IP Address Ranges Notification

Whenever there is a change to the AWS IP address ranges, we send notifications to subscribers of the `ip-ranges-diff` topic. The payload contains information in the following format:

```json
{
  "diff": [
    {
      "op": "replace",
      "path": "/syncToken",
      "value": "1442004734"
    },
    {
      "op": "replace",
      "path": "/createDate",
      "value": "2015-09-11-21-22-03"
    },
    {
      "op": "add",
      "path": "/prefixes/47",
      "value": {
        "ip_prefix": "52.92.39.0/24",
        "region": "sa-east-1",
        "service": "AMAZON"
      }
    },
    {
      "op": "replace",
      "path": "/count/TOTAL",
      "value": 27601856
    },
    {
      "op": "replace",
      "path": "/count/AMAZON",
      "value": 13877536
    }
  ],
  "createDate": "2015-09-11T21:39:19.856Z",
  "a": "https://ip-ranges-diff.s3.amazonaws.com/ranges/2015-09-10-23-22-03-1441925535.json",
  "b": "https://ip-ranges-diff.s3.amazonaws.com/ranges/2015-09-11-21-22-03-1442004734.json"
}
```

* **diff**
  [RFC 6902](https://tools.ietf.org/html/rfc6902) diff of the latest `ranges.json` document.

* **createDate**
  Date the diff was generated

* **a**
  Link to the previous `ranges.json` document published by AWS


* **b**
  Link to the current `ranges.json` document published by AWS

### To subscribe to AWS IP address range notifications

1. Open the Amazon SNS console at https://console.aws.amazon.com/sns/.

1. In the navigation bar, change the region to **US East (N. Virginia)**, if necessary. You must select this region because the SNS notifications that you are subscribing to were created in this region.

1. In the navigation pane, choose Subscriptions.

1. Choose Create Subscription.

1. In the Create Subscription dialog box, do the following:

1. In TopicARN, enter the following Amazon Resource Name (ARN):

   `arn:aws:sns:us-east-1:727601202873:ip-ranges-diff`

1. In Protocol, select the protocol that you want. For example, select Email.

1. In Endpoint, enter the endpoint to receive the notification. For example, enter an email address.

1. Choose Subscribe.

You'll be contacted on the endpoint that you specified and asked to confirm your subscription. For example, if you specified an email address, you'll receive an email message with the subject line AWS Notification - Subscription Confirmation. Follow the directions to confirm your subscription.

Notifications are subject to the availability of the endpoint. Therefore, you might want to check the JSON file periodically to ensure that you've got the latest ranges. For more information about Amazon SNS reliability, see http://aws.amazon.com/sns/faqs/#Reliability.

If you no longer want to receive these notifications, use the following procedure to unsubscribe.

### To unsubscribe from AWS IP address ranges notifications

1. Open the Amazon SNS console at https://console.aws.amazon.com/sns/.

1. In the navigation pane, choose Subscriptions.

1. Select the subscription and then choose Delete Subscriptions. When prompted for confirmation, choose Yes, Delete.