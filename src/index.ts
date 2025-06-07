import { createMiddleware } from 'hono/factory';
import { defaultConfig } from './defaultConfig';
import type {
  JsonResponseHandler,
  JSONResponseConfig,
  JSONResponseFormat,
  JR
} from './types';

declare module 'hono' {
  interface Context {
    /**
     * Success response with JSON.
     *
     * @template T The type of the response data.
     * @param {T} [data] The data to be included in the response.
     * @param {string} [msg] An optional message for the response.
     * @returns {Response} The JSON response with success status code.
     */
    ok: JsonResponseHandler;

    /**
     * Unauthorized response with JSON.
     *
     * @template T The type of the response data.
     * @param {T} [data] The data to be included in the response.
     * @param {string} [msg] An optional message for the response.
     * @returns {Response} The JSON response with unauthorized status code.
     */
    unauth: JsonResponseHandler;

    /**
     * Business error response with JSON.
     *
     * @template T The type of the response data.
     * @param {T} [data] The data to be included in the response.
     * @param {string} [msg] An optional message for the response.
     * @returns {Response} - The JSON response with business error status code.
     */
    bizerr: JsonResponseHandler;

    /**
     * System error response with JSON.
     *
     * @template T The type of the response data.
     * @param {T} [data] The data to be included in the response.
     * @param {string} [msg] An optional message for the response.
     * @returns {Response} The JSON response with system error status code.
     */
    syserr: JsonResponseHandler;

    /**
     * Custom JSON response with specified status code.
     *
     * JSONResponse(jr)
     *
     * @template T The type of the response data.
     * @param {number | string} code The custom status code for the response.
     * @param {T} [data] The data to be included in the response.
     * @param {string} [msg] An optional message for the response.
     * @returns {Response} The JSON response with custom status code.
     */
    jr: JR;
  }
}

export const jsonResponse = (
  userConfig?: JSONResponseConfig | null,
  jsonResponseFormat: JSONResponseFormat = {}
) => {
  userConfig = userConfig || {};
  if (userConfig.jr)
    throw new Error(
      'jr method is a built-in system method and cannot be overridden'
    );
  return createMiddleware(async (c, next) => {
    const {
      code: codeKey = 'code',
      data: dataKey = 'data',
      msg: msgKey = 'msg'
    } = jsonResponseFormat;

    // Check if items in userConfig have the same code as items in defaultConfig but with different method names. If so, delete the corresponding item in defaultConfig and use userConfig as the standard
    const defaultCodes = Object.values(defaultConfig).map(_ => _.code);
    for (const [methodName, methodConfig] of Object.entries(userConfig)) {
      if (defaultCodes.includes(methodConfig.code))
        delete defaultConfig[methodName];
    }

    // Merge/override configuration
    const config = { ...defaultConfig, ...userConfig };

    for (const [methodName, methodConfig] of Object.entries(config)) {
      if (methodConfig) {
        // @ts-ignore
        c[methodName] = (data, msg) => {
          return c.json({
            [codeKey]: methodConfig.code,
            // Default to null if not passed
            [dataKey]: data ?? null,
            [msgKey]: msg ?? methodConfig.defaultMsg ?? ''
          });
        };
      }
    }

    c.jr = (code, data, msg) => {
      return c.json({
        [codeKey]: code,
        [dataKey]: data ?? null,
        [msgKey]: msg ?? ''
      });
    };

    await next();
  });
};
