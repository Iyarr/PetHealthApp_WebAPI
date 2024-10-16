import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DBClient } from "./utils/dynamodb.js";
import { getEnv } from "./utils/env.js";

const TABLE_PREFIX = getEnv("TABLE_PREFIX");

const createDogsTableCommand = new CreateTableCommand({
  AttributeDefinitions: [
    {
      AttributeName: "id",
      AttributeType: "S",
    },
    {
      AttributeName: "hostId",
      AttributeType: "S",
    },
  ],
  KeySchema: [
    {
      AttributeName: "id",
      KeyType: "HASH",
    },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "hostIdIndex",
      KeySchema: [
        {
          AttributeName: "hostId",
          KeyType: "HASH",
        },
      ],
      Projection: {
        ProjectionType: "ALL",
      },
    },
  ],
  TableName: `${TABLE_PREFIX}Dogs`,
  BillingMode: "PAY_PER_REQUEST",
});

const createUsersTableCommand = new CreateTableCommand({
  AttributeDefinitions: [
    {
      AttributeName: "uid",
      AttributeType: "S",
    },
  ],
  KeySchema: [
    {
      AttributeName: "uid",
      KeyType: "HASH",
    },
  ],
  TableName: `${TABLE_PREFIX}Users`,
  BillingMode: "PAY_PER_REQUEST",
});
