
docker run -p 8000:8000 -d --rm amazon/dynamodb-local:latest \
  -jar DynamoDBLocal.jar -inMemory -port 8000

export AWS_ACCESS_KEY_ID=dummyAccessKeyId
export AWS_SECRET_ACCESS_KEY=dummySecretAccessKey
export AWS_REGION=us-west-2
export TABLE_PREFIX="Test_"
export PORT=3000
export DYNAMODB_ENDPOINT=http://localhost:8000
export ON_DEVELOPMENT=true

npm test

