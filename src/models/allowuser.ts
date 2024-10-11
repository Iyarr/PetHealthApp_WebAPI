import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";

class AllowUserModel extends Model {
  constructor() {
    super("AllowUsers");
  }

  async batchGetDogsFromId(id: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "allowUserIdIndex",
      KeyConditions: {
        allowUserId: {
          ComparisonOperator: "EQ",
          AttributeValueList: [{ S: id }],
        },
      },
    });
    return await DBClient.send(command);
  }
}

export const allowUserModel = new AllowUserModel();
