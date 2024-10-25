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
# apiテストはローカルでは実行できない
elif [ "$1" == "api" ]; then
  npm start &
  bg_pid=$!
  id=$(openssl rand -base64 24)
  name=$(openssl rand -hex 24)
  email="$(openssl rand -hex 24)@example.com"
  updatedEmail=$(openssl rand -hex 24)
  password=$(openssl rand -hex 24)
  dogId=$(openssl rand -base64 24)
  dogName=$(openssl rand -hex 24)
  token=$(
    curl -X POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$FIREBASE_API_KEY \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$email\",\"password\":\"$password\",\"returnSecureToken\":true}"
    )

  curl -X POST http://localhost:$PORT/user \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(echo $token | jq -r '.idToken')" \
    -d "{\"id\":\"$id\",\"name\":\"$name\",\"email\":\"$email\"}"

  curl -X PUT http://localhost:$PORT/user \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(echo $token | jq -r '.idToken')" \
    -d "{\"email\":\"$updatedEmail\"}"

  curl http://localhost:$PORT/user \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(echo $token | jq -r '.idToken')"

  curl -X POST http://localhost:$PORT/dog \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(echo $token | jq -r '.idToken')" \
    -d "{\"id\":\"$dogId\",\"name\":\"$dogName\",\"gender\":\"female\",\"size\":\"big\",\"hostId\":\"$(echo $token | jq -r '.localId')\"}"

  curl http://localhost:$PORT/dog/$dogId \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(echo $token | jq -r '.idToken')"

  curl -X PUT http://localhost:$PORT/dog/$dogId \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(echo $token | jq -r '.idToken')" \
    -d "{\"gender\":\"male\",\"size\":\"small\"}"

  curl -X DELETE http://localhost:$PORT/user \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(echo $token | jq -r '.idToken')"

  curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=$FIREBASE_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"idToken\":\"$(echo $token | jq -r '.idToken')\"}"

  kill $bg_pid
fi

docker stop dynamodb