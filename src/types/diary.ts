import {
  diariesTableNumberPK,
  diariesTableStringPK,
  diariesTableNumberListAttributes,
  diariesTableStringAttributes,
  diaryItemsTableNumberPK,
  diaryItemsTableItems,
  diaryItemOptionsTableNumberPK,
  diaryItemOptionsTableNumberAttributes,
  diaryItemOptionsTableStringAttributes,
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
export type DiariesTableNumberListAttributes = {
  [K in (typeof diariesTableNumberListAttributes)[number]]: number[];
};
export type DiariesTableAttributes = DiariesTableStringAttributes &
  DiariesTableNumberListAttributes;

export type DiariesTableItems = DiariesTablePK & DiariesTableAttributes;
// DiaryItems
export type DiaryItemsTableNumberPK = {
  [K in (typeof diaryItemsTableNumberPK)[number]]: number;
};

export type DiaryItemsTablePK = DiaryItemsTableNumberPK;

export type DiaryItemsTableAttributes = {
  [K in (typeof diaryItemsTableItems)[number]]: string;
};

export type DiaryItemsTableItems = DiariesTablePK & DiariesTableAttributes;
// DiaryItemOptions
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
