import { Hono } from 'hono';
import { jsonResponse } from '.';
import { Code, type JsonResponseHandler } from './types';

declare module 'hono' {
  interface Context {
    custom1: JsonResponseHandler;
    custom2: JsonResponseHandler;
    custom3: JsonResponseHandler;
  }
}

describe('jsonResponse middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  it('should test all default methods: ok, unauth, bizerr, syserr', async () => {
    app.use('*', jsonResponse());
    app.get('/ok', c => c.ok({ name: 'ok' }));
    app.get('/unauth', c => c.unauth({ name: 'unauth' }));
    app.get('/bizerr', c => c.bizerr({ name: 'bizerr' }));
    app.get('/syserr', c => c.syserr({ name: 'syserr' }));

    const okRes = await app.request('/ok');
    expect(await okRes.json()).toEqual({
      code: Code.OK,
      data: { name: 'ok' },
      msg: 'Operation successful'
    });

    const unauthRes = await app.request('/unauth');
    expect(await unauthRes.json()).toEqual({
      code: Code.UNAUTH,
      data: { name: 'unauth' },
      msg: 'Unauthorized'
    });

    const bizRes = await app.request('/bizerr');
    expect(await bizRes.json()).toEqual({
      code: Code.BIZERR,
      data: { name: 'bizerr' },
      msg: 'Business error'
    });

    const sysRes = await app.request('/syserr');
    expect(await sysRes.json()).toEqual({
      code: Code.SYSERR,
      data: { name: 'syserr' },
      msg: 'System error'
    });
  });

  it('should add custom methods to context', async () => {
    app.use(
      '*',
      jsonResponse({
        custom1: { code: 1111, defaultMsg: 'custom1 defaultMsg' }
      })
    );
    app.get('/custom1', c => {
      return c.custom1({ name: 'custom1' });
    });

    const res = await app.request('/custom1');
    expect(await res.json()).toEqual({
      code: 1111,
      data: { name: 'custom1' },
      msg: 'custom1 defaultMsg'
    });
  });

  it('should override system default config', async () => {
    app.use(
      '*',
      jsonResponse({
        ok: { code: 20000, defaultMsg: 'override ok defaultMsg' }
      })
    );
    app.get('/ok-override', c => c.ok({ name: 'ok-override' }));
    const okRes = await app.request('/ok-override');
    expect(await okRes.json()).toEqual({
      code: 20000,
      data: { name: 'ok-override' },
      msg: 'override ok defaultMsg'
    });
  });

  it('should handle no data passed', async () => {
    app.use('*', jsonResponse());
    app.get('/test', c => c.ok());
    const res = await app.request('/test');
    expect(await res.json()).toEqual({
      code: Code.OK,
      data: null,
      msg: 'Operation successful'
    });
  });

  it('should fallback to empty string when defaultMsg is empty', async () => {
    app.use(
      '*',
      jsonResponse({
        custom2: { code: 2222 }
      })
    );
    app.get('/custom2', c => {
      return c.custom2({ name: 'custom2' });
    });
    const res = await app.request('/custom2');
    expect(await res.json()).toEqual({
      code: 2222,
      data: { name: 'custom2' },
      msg: ''
    });
  });

  it('should use jr method for custom code response', async () => {
    app.use('*', jsonResponse());
    app.get('/jr', c => {
      return c.jr('1234');
    });
    const res = await app.request('/jr');
    expect(await res.json()).toEqual({
      code: '1234',
      data: null,
      msg: ''
    });
  });

  it('should throw error when trying to override jr method', () => {
    expect(() => {
      jsonResponse({
        jr: { code: 0 }
      });
    }).toThrow(
      'jr method is a built-in system method and cannot be overridden'
    );
  });

  it('should remove default config when user config has same code', async () => {
    app.use(
      '*',
      jsonResponse({
        custom3: { code: 2000 }
      })
    );
    app.get('/custom3', c => {
      return c.custom3({ name: 'custom3' });
    });
    const res = await app.request('/custom3');
    expect(await res.json()).toEqual({
      code: 2000,
      data: { name: 'custom3' },
      msg: ''
    });
  });

  it('should use custom response format keys', async () => {
    app.use(
      '*',
      jsonResponse(null, { code: 'status', data: 'result', msg: 'message' })
    );
    app.get('/custom-json-response-format', c => {
      return c.ok({ name: 'custom-json-response-format' });
    });
    const res = await app.request('/custom-json-response-format');
    expect(await res.json()).toEqual({
      status: 2000,
      result: { name: 'custom-json-response-format' },
      message: 'Operation successful'
    });
  });
});
