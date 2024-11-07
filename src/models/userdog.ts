import { QueryCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";

class UserDogs extends Model {
  constructor() {
    super("UserDogs");
  }

  async getAllowedDogsFromUid(uid: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "hostUidIndex",
      KeyConditions: {
        hostUid: {
          ComparisonOperator: "EQ",
          AttributeValueList: [this.createAttributeValue(uid)],
        },
      },
    });
    return await DBClient.send(command);
  }

  async deleteUserDog(uid: string, dogId: string) {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        hostUid: this.createAttributeValue(uid),
        id: this.createAttributeValue(dogId),
      },
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log({ uid, dogId }, result);
      throw new Error("Failed to post item");
    }
    return this.formatItemFromCommand(result.Attributes);
  }
}

export const userDogModel = new UserDogs();
