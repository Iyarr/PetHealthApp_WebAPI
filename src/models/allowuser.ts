import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";

export class AllowUserModel extends Model {
  constructor() {
    super("AllowUsers");
  }

  batchGetDogsFromId(id: string) {
    return new QueryCommand({
      TableName: this.tableName,
      IndexName: "allowUserIdIndex",
      KeyConditions: {
        allowUserId: {
          ComparisonOperator: "EQ",
          AttributeValueList: [{ S: id }],
        },
      },
    });
  }
}
