import {
  diariesTablePK,
  diariesTableItems,
  itemsTablePK,
  itemsTableItems,
  optionsTablePK,
  optionsTableItems,
} from "../common/dynamodb.js";
// Request
export type DiaryPOSTRequestBody = {
  title: string;
  body: string;
};

export type DiaryPOSTRequestParams = {
  dogId: string;
  date: string;
};

export type DiaryGETRequestParams = {
  dogId: string;
  date: string;
};

export type DiaryGETMonthRequestParams = {
  year: string;
  month: string;
};

export type DiaryPUTRequestParams = {
  dogId: string;
  date: string;
};

export type DiaryPUTRequestBody = {
  title: string;
  body: string;
};

export type DiaryDELETERequestParams = {
  dogId: string;
  date: string;
};

// Response

// DynamoDB
// Diaries
export type DiaryTablePKObjectType = {
  [K in (typeof diariesTablePK)[number]]: string;
};

export type DiaryTableItemsObjectType = {
  [K in (typeof diariesTableItems)[number]]: string;
};

// Items
export type ItemsTablePKObjectType = {
  [K in (typeof itemsTablePK)[number]]: string;
};

export type ItemsTableItemsObjectType = {
  [K in (typeof itemsTableItems)[number]]: string;
};

// Options
export type OptionsTablePKObjectType = {
  [K in (typeof optionsTablePK)[number]]: string;
};

export type OptionsTableItemsObjectType = {
  [K in (typeof optionsTableItems)[number]]: string;
};
