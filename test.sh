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

if [ "$1" == "unit" ]; then
  docker compose up --build --force-recreate --abort-on-container-exit
  docker compose down -v
elif [ "$1" == "api" ]; then
  docker run -p 8000:8000 -d --rm --name dynamodb amazon/dynamodb-local:latest \
    -jar DynamoDBLocal.jar -port $DYNAMODB_PORT
  npm run build
  find dist/ -name '*.js'
  echo "Building done"
  sleep 1
  node dist/tests/init.js
  echo "DynamoDB initialized"
  sleep 1
  nohup npm start > result.log 2>&1 &
  echo "Server started"
  bpid=$!
  sleep 5
  echo "Test started"
  node --test dist/tests/api.js
  kill $bpid
  docker stop dynamodb
fi

exit 0