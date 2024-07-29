import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "./get.js";

export class Client {
  client: DynamoDBClient;
  getCommand: GetCommand;

  constructor() {
    this.client = new DynamoDBClient();
    this.getCommand = new GetCommand();
  }
}
