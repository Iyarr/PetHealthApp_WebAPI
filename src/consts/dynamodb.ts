export const DynamoDB = {
  Tables: {
    Dogs: {
      pk: {
        name: "id",
        type: "number",
      },
      attributes: {
        string: ["name", "size", "ownerUid"],
      },
      gsi: [
        {
          name: "ownerUidIndex",
          pk: "ownerUid",
          Projection: "ALL",
        },
      ],
    },
    UserDogs: {
      pk: {
        name: "uid",
        type: "string",
      },
      sk: {
        name: "dogId",
        type: "number",
      },
      attributes: {
        string: ["ownerUid"],
        boolean: ["isAccepted", "isAnswered"],
      },
      gsi: [
        {
          name: "dogIdIndex",
          pk: "dogId",
          Projection: "ALL",
        },
        {
          name: "ownerUidIndex",
          pk: "ownerUid",
          Projection: "ALL",
        },
      ],
    },
    Diaries: {
      pk: {
        name: "date",
        type: "string",
      },
      sk: {
        name: "dogId",
        type: "number",
      },
      attributes: {
        string: ["memo", "createdUid"],
        number: ["itemId"],
      },
    },
    DiaryItems: {
      pk: {
        name: "id",
        type: "number",
      },
      attributes: {
        string: ["name"],
      },
    },
    DiaryItemDetails: {
      pk: {
        name: "id",
        type: "number",
      },
      attributes: {
        string: ["name"],
        number: ["itemId"],
      },
    },
    DiaryItemOptions: {
      pk: {
        name: "itemId",
        type: "number",
      },
      sk: {
        name: "optionId",
        type: "number",
      },
      attributes: {
        string: ["name"],
        number: ["level"],
      },
    },
  },
  Config: {
    BillingMode: "PAY_PER_REQUEST",
  },
  Type: {
    string: "S",
    number: "N",
    boolean: "BOOL",
  },
  KeyType: {
    HASH: "HASH",
    RANGE: "RANGE",
  },
  BatchWriteLimit: 25,
  BatchGetLimit: 100,
  Test: {
    Region: "us-west-2",
    AccessKeyId: "dummyAccessKeyId",
    SecretAccessKey: "dummySecretAccessKey",
  },
} as const;
