import { QueryCommand, DeleteItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";
import { UserDogsDELETERequestParams } from "../types/userdog.js";

class UserDogs extends Model {
  constructor() {
    super("UserDogs");
  }

  async getDogIdsFromUid(uid: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "uidIndex",
      KeyConditions: {
        uid: {
          ComparisonOperator: "EQ",
          AttributeValueList: [this.createAttributeValue(uid)],
        },
      },
    });
    const result = await DBClient.send(command);
    return result.Items.map((item) => this.formatItemFromCommand(item));
  }

  async getUsersFromDogId(dogId: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "dogIdIndex",
      KeyConditions: {
        dogId: {
          ComparisonOperator: "EQ",
          AttributeValueList: [this.createAttributeValue(dogId)],
        },
      },
    });
    const result = await DBClient.send(command);
    return result.Items.map((item) => this.formatItemFromCommand(item));
  }

  async update(dogId: string, uid: string, isAccepted: boolean) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        uid: this.createAttributeValue(uid),
        dogId: this.createAttributeValue(dogId),
        isAccepted: this.createAttributeValue(isAccepted),
      },
      ConditionExpression: "attribute_exists(#uid) AND attribute_exists(#dogId)",
      ExpressionAttributeNames: {
        "#uid": "uid",
        "#dogId": "dogId",
      },
    });
    const result = await DBClient.send(command);
  }

  async delete(pk: UserDogsDELETERequestParams, ownerUid: string) {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
      ConditionExpression: "#ownerUid = :ownerUid",
      ExpressionAttributeNames: {
        "#ownerUid": "ownerUid",
      },
      ExpressionAttributeValues: {
        ":ownerUid": this.createAttributeValue(ownerUid),
      },
    });

    const result = await DBClient.send(command);
    return this.formatItemFromCommand(result.Attributes);
  }
}

export const userDogModel = new UserDogs();
