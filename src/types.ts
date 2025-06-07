// Built-in system codes
export enum Code {
  OK = 2000,
  UNAUTH = 4000,
  BIZERR = 5000,
  SYSERR = 5100
}

export type JSONResponseConfig = {
  [key: string]: {
    code: number | string;
    defaultMsg?: string;
  };
};

export interface JSONResponseFormat {
  code?: string;
  data?: string;
  msg?: string;
}

export type JsonResponseHandler = <T>(data?: T, msg?: string) => Response;

export type JR = <T>(code: number | string, data?: T, msg?: string) => Response;
