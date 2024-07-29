import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "./get.js";

export class Client {
  client: DynamoDBClient;
  getCommand: GetCommand;

  constructor(client: DynamoDBClient) {
    this.client = client;
    this.getCommand = new GetCommand();
  }
}
