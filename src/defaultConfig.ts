import { Code, type JSONResponseConfig } from './types';

export const defaultConfig: JSONResponseConfig = {
  ok: {
    code: Code.OK,
    defaultMsg: 'Operation successful'
  },
  unauth: {
    code: Code.UNAUTH,
    defaultMsg: 'Unauthorized'
  },
  bizerr: {
    code: Code.BIZERR,
    defaultMsg: 'Business error'
  },
  syserr: {
    code: Code.SYSERR,
    defaultMsg: 'System error'
  }
};
