export const dogsTablePK = "id" as const;
export const dogsTableItems = ["id", "name", "size", "hostUid"] as const;
export const userDogsTablePK = ["uid", "dogId"] as const;
export const userDogsTableItems = ["isAccepted", "isAnswered"] as const;
export const userDogsTableIndex = "dogIdIndex" as const;
export const userDogsTableIndexKey = "dogId" as const;
