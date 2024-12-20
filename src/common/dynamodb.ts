// Config
export const DynamoDBBatchWriteLimit = 25;
export const DynamoDBBatchGetLimit = 100;
export const AttributeTypeNames = ["S", "N", "BOOL"] as const;

// Tables
export const dogsTablePK = ["id"] as const;
export const dogsTableAttributes = ["name", "size", "ownerUid"] as const;
export const dogsTableItems = [...dogsTablePK, ...dogsTableAttributes] as const;

export const userDogsTableStringPK = ["uid"] as const;
export const userDogsTableNumberPK = ["dogId"] as const;
export const userDogsTablePK = [...userDogsTableStringPK, ...userDogsTableNumberPK] as const;

export const userDogsTableBooleanAttributes = ["isAccepted", "isAnswered"] as const;
export const userdogsTableStringAttributes = ["ownerUid"] as const;
export const userDogsTableItems = [
  ...userDogsTablePK,
  ...userDogsTableBooleanAttributes,
  ...userdogsTableStringAttributes,
];
export const userDogsTableIndex = "dogIdIndex";
export const userDogsTableIndexKey = "dogId";
