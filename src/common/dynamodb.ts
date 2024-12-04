// Config
export const DynamoDBBatchWriteLimit = 25;
export const DynamoDBBatchGetLimit = 100;

// Tables
export const dogsTablePK = "id";
export const dogsTableItems = ["name", "size", "hostUid"];
export const userDogsTablePK = ["uid", "dogId"] as const;
export const userDogsTableBooleanAttributes = ["isAccepted", "isAnswered"] as const;
export const userdogsTableStringAttributes = ["ownerUid"] as const;
export const userDogsTableItems = [
  ...userDogsTablePK,
  ...userDogsTableBooleanAttributes,
  ...userdogsTableStringAttributes,
];
export const userDogsTableIndex = "dogIdIndex";
export const userDogsTableIndexKey = "dogId";
