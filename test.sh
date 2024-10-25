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
  -jar DynamoDBLocal.jar -inMemory -port $DYNAMODB_PORT

if [ "$1" == "unit" ]; then
  npm test
