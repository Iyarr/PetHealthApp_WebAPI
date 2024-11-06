export type DogPOSTRequestBody = {
  id: string;
  name: string;
  gender: string;
  size: string;
};

export type DogPUTRequestBody = {
  name?: string;
  gender?: string;
  size?: string;
};
