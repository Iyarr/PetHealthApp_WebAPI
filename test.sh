#!/bin/bash

# Set environment variables
export AWS_ACCESS_KEY_ID=dummyAccessKeyId
export AWS_SECRET_ACCESS_KEY=dummySecretAccessKey
export AWS_REGION=us-west-2
export TABLE_PREFIX=Test_
export PORT=3000
export DYNAMODB_PORT=8000
export DYNAMODB_ENDPOINT=http://localhost:$DYNAMODB_PORT
export ON_DEVELOPMENT=true

# Run DynamoDB Local
docker run -p 8000:8000 -d --rm --name dynamodb amazon/dynamodb-local:latest \
  -jar DynamoDBLocal.jar -port $DYNAMODB_PORT

npm run build
node dist/tests/init.js
sleep 5
if [ "$1" == "unit" ]; then
  npm run test:unit
elif [ "$1" == "api" ]; then
  nohup npm start > /dev/null 2>&1 &
  bpid=$!
  sleep 10
  npm run test:api
  kill $bpid
fi

docker stop dynamodb