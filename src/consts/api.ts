export const API = {
  Message: {
    Success: {
      200: "OK",
      201: "Created",
    },
    Error: {
      400: "Bad Request",
      401: "Unauthorized",
      404: "Not Found",
      409: "Conflicted",
      500: "Internal Server Error",
    },
    Start: "API Server is running on port",
  },
  Firebase: {
    Authorization_Header: "Authorization",
    Authorization_Header_Prefix: "Bearer ",
    Error_Message: "Authorization header is invalid",
  },
};
