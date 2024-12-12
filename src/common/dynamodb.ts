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
export const userDogsTableAttributes = [
  ...userDogsTableBooleanAttributes,
  ...userdogsTableStringAttributes,
] as const;
export const userDogsTableItems = [...userDogsTablePK, ...userDogsTableAttributes];

export const userDogsTableIndex = "dogIdIndex";
export const userDogsTableIndexKey = "dogId";

// Diaries
export const diariesTableStringPK = ["date"] as const;
export const diariesTableNumberPK = ["dogId"] as const;
export const diariesTablePK = [...diariesTableStringPK, ...diariesTableNumberPK] as const;

export const diariesTableStringAttributes = ["memo", "createdUid"] as const;
export const diariesTableNumberListAttributes = ["itemIds"] as const;
export const diariesTableAttributes = [
  ...diariesTableStringAttributes,
  ...diariesTableNumberListAttributes,
];
export const diariesTableItems = [...diariesTablePK, ...diariesTableAttributes] as const;

// DiaryItems
export const diaryItemsTableNumberPK = ["id"] as const;
export const diaryItemsTablePK = [...diaryItemsTableNumberPK] as const;

export const diaryItemsTableStringAttributes = ["name"] as const;
export const diaryItemsTableAttributes = [...diaryItemsTableStringAttributes] as const;
export const diaryItemsTableItems = [...diaryItemsTablePK, ...diaryItemsTableAttributes] as const;

// DiaryItemOptions
export const diaryItemOptionsTableNumberPK = ["itemId", "optionId"] as const;
export const diaryItemOptionsTablePK = [...diaryItemOptionsTableNumberPK] as const;

export const diaryItemOptionsTableNumberAttributes = ["level"] as const;
export const diaryItemOptionsTableStringAttributes = ["name"] as const;
export const diaryItemOptionsTableAttributes = [
  ...diaryItemOptionsTableNumberAttributes,
  ...diaryItemOptionsTableStringAttributes,
];
export const diaryItemOptionsTableItems = [
  ...diaryItemOptionsTablePK,
  ...diaryItemOptionsTableAttributes,
] as const;
