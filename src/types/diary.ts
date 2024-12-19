import { DynamoDB } from "../consts/dynamodb.js";

const diariesTableStringPK = [DynamoDB.Tables.Diaries.pk.name];
const diariesTableNumberPK = [DynamoDB.Tables.Diaries.sk.name];
const diariesTablePK = [...diariesTableStringPK, ...diariesTableNumberPK];

const diariesTableStringAttributes = [...DynamoDB.Tables.Diaries.attributes.string];
const diariesTableNumberAttributes = [...DynamoDB.Tables.Diaries.attributes.number];
const diariesTableAttributes = [...diariesTableStringAttributes, ...diariesTableNumberAttributes];
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
