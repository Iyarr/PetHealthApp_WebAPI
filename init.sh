#!/bin/bash

echo "Init Tables"
node dist/tests/init.js > ./log/init.log
echo "DynamoDB initialized"
sleep 1
echo "Starting unit test"
npm run test:unit > ./log/unit.log
echo "Unit test done"

tail -f /dev/null
exit 0