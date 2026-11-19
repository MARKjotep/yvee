export type successStatus<T extends Record<string, unknown> = {}> = {
  success: boolean;
  data: T;
  message?: string;
};
export type errorStatus = {
  success: boolean;
  error: { message: string; code: string } & Record<string, unknown>;
};
