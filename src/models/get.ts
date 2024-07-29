import { GetItemCommand, GetItemCommandOutput } from "@aws-sdk/client-dynamodb";

export class GetCommand {
  async createGetCommand(id: string, tableName: string) {
    return new GetItemCommand({
      TableName: tableName,
      Key: {
        id: { S: id },
      },
    });
  }

  async responseData(output: GetItemCommandOutput) {
    return output.Item;
  }
}
