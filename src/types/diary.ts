import {
  diariesTableNumberPK,
  diariesTableStringPK,
  diariesTablePK,
  diariesTableNumberAttributes,
  diariesTableStringAttributes,
  diariesTableAttributes,
  diaryItemsTableNumberPK,
  diaryItemsTableNumberAttributes,
  diaryItemDetailsTableNumberPK,
  diaryItemDetailsTableStringAttributes,
  diaryItemOptionsTableNumberPK,
  diaryItemOptionsTableNumberAttributes,
  diaryItemOptionsTableStringAttributes,
} from "../common/dynamodb.js";
// Request
export type DiaryPOSTRequestBody = {
  [K in (typeof diariesTableAttributes)[number]]: string;
};

export type DiaryPOSTRequestParams = {
  [K in (typeof diariesTablePK)[number]]: string;
};

export type DiaryGETRequestParams = {
  [K in (typeof diariesTablePK)[number]]: string;
};

export type DiaryGETMonthRequestParams = {
  year: string;
  month: string;
};

export type DiaryPUTRequestParams = {
  [K in (typeof diariesTablePK)[number]]: string;
};

export type DiaryPUTRequestBody = {
  [K in (typeof diariesTableAttributes)[number]]: string;
};

export type DiaryDELETERequestParams = {
  [K in (typeof diariesTablePK)[number]]: string;
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
export type DiariesTableNumberAttributes = {
  [K in (typeof diariesTableNumberAttributes)[number]]: number;
};
export type DiariesTableAttributes = DiariesTableStringAttributes & DiariesTableNumberAttributes;

export type DiariesTableItems = DiariesTablePK & DiariesTableAttributes;
// DiaryItems
export type DiaryItemsTableNumberPK = {
  [K in (typeof diaryItemsTableNumberPK)[number]]: number;
};

export type DiaryItemsTablePK = DiaryItemsTableNumberPK;

export type DiaryItemsTableAttributes = {
  [K in (typeof diaryItemsTableNumberAttributes)[number]]: number;
};

// DiaryItemDetails
export type DiaryItemDetailsTableNumberPK = {
  [K in (typeof diaryItemDetailsTableNumberPK)[number]]: number;
};
export type DiaryItemDetailsTablePK = DiaryItemDetailsTableNumberPK;

export type DiaryItemDetailsTableStringAttributes = {
  [K in (typeof diaryItemDetailsTableStringAttributes)[number]]: string;
};
export type DiaryItemDetailsTableAttributes = DiaryItemDetailsTableStringAttributes;

export type DiaryItemDetailsTableItems = DiaryItemDetailsTablePK & DiaryItemDetailsTableAttributes;
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
