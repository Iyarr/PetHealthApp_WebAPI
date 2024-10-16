import {
  CreateTableCommand,
  ListTablesCommand,
  CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";
import { DBClient } from "./utils/dynamodb.js";
import { getEnv } from "./utils/env.js";

const TABLE_PREFIX = getEnv("TABLE_PREFIX");

class CreateTableCommands {
  commands: CreateTableCommand[];
  constructor() {
    this.commands = [];
  }

  add(command: CreateTableCommandInput) {
    this.commands.push(new CreateTableCommand(command));
  }

  async create() {
    const listTablesCommandResult = await DBClient.send(new ListTablesCommand({}));
    console.log(listTablesCommandResult);
    for (const command of this.commands) {
      if (!listTablesCommandResult.TableNames.includes(command.input.TableName)) {
        console.log(await DBClient.send(command));
      }
    }
  }
}

const createTableCommands = new CreateTableCommands();
createTableCommands.add({
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

createTableCommands.add({
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

await createTableCommands.create();
