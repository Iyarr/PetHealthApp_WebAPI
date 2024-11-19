export const dogsTablePK = "id";
export const dogsTableItems = ["name", "size", "hostUid"];
export const userDogsTablePK = ["uid", "dogId"] as const;
export const userDogsTableItems = ["isAccepted", "isAnswered"] as const;
export const userDogsTableIndex = "dogIdIndex";
export const userDogsTableIndexKey = "dogId";
