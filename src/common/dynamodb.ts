// Config
export const DynamoDBBatchWriteLimit = 25;
export const DynamoDBBatchGetLimit = 100;
export const AttributeTypeNames = ["S", "N", "BOOL"] as const;
export const tableNames = [
  "Dogs",
  "UserDogs",
  "Diaries",
  "DiaryItems",
  "DiaryItemDetails",
  "DiaryItemOptions",
] as const;

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
export const diariesTableNumberAttributes = ["itemId"] as const;
export const diariesTableAttributes = [
  ...diariesTableStringAttributes,
  ...diariesTableNumberAttributes,
];
export const diariesTableItems = [...diariesTablePK, ...diariesTableAttributes] as const;

// DiaryItems
export const diaryItemsTableNumberPK = ["id"] as const;
export const diaryItemsTablePK = [...diaryItemsTableNumberPK] as const;

export const diaryItemsTableNumberAttributes = ["detailId", "optionId"] as const;
export const diaryItemsTableAttributes = [...diaryItemsTableNumberAttributes] as const;
export const diaryItemsTableItems = [...diaryItemsTablePK, ...diaryItemsTableAttributes] as const;

// DiaryItemDetails
export const diaryItemDetailsTableNumberPK = ["id"] as const;
export const diaryItemDetailsTablePK = [...diaryItemsTableNumberPK] as const;

export const diaryItemDetailsTableStringAttributes = ["name"] as const;
export const diaryItemDetailsTableAttributes = [...diaryItemDetailsTableStringAttributes] as const;
export const diaryItemDetailsTableItems = [
  ...diaryItemDetailsTablePK,
  ...diaryItemDetailsTableAttributes,
] as const;

// DiaryItemOptions
export const diaryItemOptionsTableNumberPK = ["id"] as const;
export const diaryItemOptionsTablePK = [...diaryItemOptionsTableNumberPK] as const;

export const diaryItemOptionsTableNumberAttributes = ["itemId", "level"] as const;
export const diaryItemOptionsTableStringAttributes = ["name"] as const;
export const diaryItemOptionsTableAttributes = [
  ...diaryItemOptionsTableNumberAttributes,
  ...diaryItemOptionsTableStringAttributes,
];
export const diaryItemOptionsTableItems = [
  ...diaryItemOptionsTablePK,
  ...diaryItemOptionsTableAttributes,
] as const;
