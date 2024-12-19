import { DynamoDB } from "../consts/dynamodb.js";

// Diaries
const diariesTableStringPK = [DynamoDB.Tables.Diaries.pk.name];
const diariesTableNumberPK = [DynamoDB.Tables.Diaries.sk.name];

const diariesTableStringAttributes = [...DynamoDB.Tables.Diaries.attributes.string];
const diariesTableNumberAttributes = [...DynamoDB.Tables.Diaries.attributes.number];

export type DiariesTableNumberPK = {
  [K in (typeof diariesTableNumberPK)[number]]: number;
};
export type DiariesTableStringPK = {
  [K in (typeof diariesTableStringPK)[number]]: string;
};
export type DiariesTablePK = DiariesTableNumberPK & DiariesTableStringPK;

export type DiariesTableStringAttributes = {
  [K in (typeof diariesTableStringAttributes)[number]]: string;
};
export type DiariesTableNumberAttributes = {
  [K in (typeof diariesTableNumberAttributes)[number]]: number;
};
export type DiariesTableAttributes = DiariesTableStringAttributes & DiariesTableNumberAttributes;

export type DiariesTableItems = DiariesTablePK & DiariesTableAttributes;

// DiaryItems
const diaryItemsTableNumberPK = [DynamoDB.Tables.DiaryItems.pk.name];

const diaryItemsTableStringAttributes = [...DynamoDB.Tables.DiaryItems.attributes.string];

export type DiaryItemsTableNumberPK = {
  [K in (typeof diaryItemsTableNumberPK)[number]]: number;
};
export type DiaryItemsTablePK = DiaryItemsTableNumberPK;

export type diaryItemsTableStringAttributes = {
  [K in (typeof diaryItemsTableStringAttributes)[number]]: string;
};
export type DiaryItemsTableAttributes = diaryItemsTableStringAttributes;

// DiaryItemDetails
const diaryItemDetailsTableNumberPK = [DynamoDB.Tables.DiaryItemDetails.pk.name];

const diaryItemDetailsTableStringAttributes = [
  ...DynamoDB.Tables.DiaryItemDetails.attributes.string,
];
const diaryItemDetailsTableNumberAttributes = [
  ...DynamoDB.Tables.DiaryItemDetails.attributes.number,
];

export type DiaryItemDetailsTableNumberPK = {
  [K in (typeof diaryItemDetailsTableNumberPK)[number]]: number;
};
export type DiaryItemDetailsTablePK = DiaryItemDetailsTableNumberPK;

export type DiaryItemDetailsTableStringAttributes = {
  [K in (typeof diaryItemDetailsTableStringAttributes)[number]]: string;
};
export type DiaryItemDetailsTableNumberAttributes = {
  [K in (typeof diaryItemDetailsTableNumberAttributes)[number]]: number;
};
export type DiaryItemDetailsTableAttributes = DiaryItemDetailsTableStringAttributes &
  DiaryItemDetailsTableNumberAttributes;

export type DiaryItemDetailsTableItems = DiaryItemDetailsTablePK & DiaryItemDetailsTableAttributes;
// DiaryItemOptions

const diaryItemOptionsTableNumberPK = [DynamoDB.Tables.DiaryItemOptions.pk.name];

const diaryItemOptionsTableStringAttributes = [
  ...DynamoDB.Tables.DiaryItemOptions.attributes.string,
];
const diaryItemOptionsTableNumberAttributes = [
  ...DynamoDB.Tables.DiaryItemOptions.attributes.number,
];

export type DiaryItemOptionsTableNumberPK = {
  [K in (typeof diaryItemOptionsTableNumberPK)[number]]: number;
};
export type DiaryItemOptionsTablePK = DiaryItemOptionsTableNumberPK;

export type DiaryItemOptionsTableNumberAttributes = {
  [K in (typeof diaryItemOptionsTableNumberAttributes)[number]]: number;
};
export type DiaryItemOptionsTableStringAttributes = {
  [K in (typeof diaryItemOptionsTableStringAttributes)[number]]: string;
};
export type DiaryItemOptionsTableAttributes = DiaryItemOptionsTableNumberAttributes &
  DiaryItemOptionsTableStringAttributes;

export type DiaryItemOptionsTableItems = DiaryItemOptionsTablePK & DiaryItemOptionsTableAttributes;
