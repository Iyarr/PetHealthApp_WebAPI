#!/bin/bash

# Set environment variables
export MYSQL_USER=api
export MYSQL_PASSWORD=api_password
export MYSQL_DATABASE=PetHealth
export DB_PORT=8000

export API_PORT=3000
export ON_DEVELOPMENT=true

npm run build
find dist/ -name '*.js'
sleep 1
node dist/tests/init.js
echo "DynamoDB initialized"
sleep 1
if [ "$1" == "unit" ]; then
  find dist/tests/unit -name '*.js' | xargs node --test
elif [ "$1" == "api" ]; then
  nohup npm start > result.txt 2>&1 &
  echo "Server started"
  bpid=$!
  sleep 5
  echo "Test started"
  node --test dist/tests/api.js
  kill $bpid
fi

docker stop dynamodb