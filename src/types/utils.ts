export type ResponseBody<T> = {
  message: string;
  data: T;
};

export type ResponseOnlyMessage = {
  message: string;
};
