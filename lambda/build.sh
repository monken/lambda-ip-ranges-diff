rm lambda.zip
zip lambda -r index.js node_modules/
VERSION=$(date "+%Y%m%d")
aws s3 cp lambda.zip s3://netcubed-cfn/ip-ranges-diff/$VERSION/lambda.zip
