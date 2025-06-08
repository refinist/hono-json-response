# <img src="https://hono.dev/images/logo.svg" width="24" height="24" /> Hono jsonResponse Middleware [![npm](https://img.shields.io/npm/v/hono-json-response.svg?style=flat&colorA=E36002&colorB=FF9C24)](https://npmjs.com/package/hono-json-response) [![codecov](https://img.shields.io/codecov/c/github/refinist/hono-json-response?style=flat&colorA=E36002&colorB=FF9C24)](https://codecov.io/github/refinist/hono-json-response)

A Hono middleware for standardized JSON responses

## Why Choose This Middleware?

### ❌ Traditional Approach: Repetitive and Error-Prone

```typescript
return c.json({ code: 2000, data: users, msg: 'Operation successful' });
return c.json({ code: 2000, data: roles, msg: 'Operation successful' });
return c.json({ code: 5000, data: null, msg: 'Username already exists' });
return c.json({ code: 5100, data: null, msg: 'System error' });
```

### ✅ Using Middleware: Semantic and Concise

```typescript
return c.ok(users, 'Operation successful');
return c.ok(roles); // No need to pass "Operation successful" every time, as it's the default
return c.bizerr(null, 'Username already exists');
return c.syserr();
```

## Features

- 🚀 **Unified JSON Response Format** - Standardized API response structure
- 🎯 **Semantic Response Methods** - `c.ok()` is more intuitive than `c.json({code: 2000})`
- 🔧 **Eliminate Boilerplate Code** - Say goodbye to repetitive `c.json({code: xxx, data: xxx, msg: xxx})` patterns
- 📝 **Predefined Common Scenarios** - ok(success), unauth(unauthorized), bizerr(business error), syserr(system error)
- 🛠️ **Flexible Extension** - Support for custom response methods and status codes
- 💪 **Type Safety** - Complete TypeScript support and intelligent hints

## Install

```bash
# npm
npm install hono-json-response

# yarn
yarn add hono-json-response

# pnpm
pnpm add hono-json-response

# bun
bun add hono-json-response
```

## Basic Usage

```typescript
import { Hono } from 'hono';
import { jsonResponse } from 'hono-json-response';

const app = new Hono();
app.use('*', jsonResponse());
app.get('/getUserList', c => {
  return c.ok(
    {
      list: [{ name: 'John' }, { name: 'Jane' }],
      totals: 100
    },
    'Get user list successfully'
  );
});
```

## Response Format

### Default Format

All responses follow a unified JSON format (code, data, msg):

```json
{
  "code": 2000,
  "data": null,
  "msg": ""
}
```

### Custom Field Names

Support custom response field names to adapt to different project API specifications:

```ts
app.use(
  '*',
  jsonResponse(null, {
    code: 'status', // code -> status
    data: 'result', // data -> result
    msg: 'message' // msg -> message
  })
);
```

## Predefined Methods

### `c.ok(data?, msg?)`

Success response

- **Status Code**: 2000
- **Usage**: When operation is successful

```ts
app.get('/getUserList', c => {
  return c.ok(
    {
      list: [{ name: 'John' }, { name: 'Jane' }],
      totals: 100
    },
    'Get user list successfully'
  );
});
```

### `c.unauth(data?, msg?)`

Unauthorized response

- **Status Code**: 4000
- **Usage**: When user is not logged in or token is invalid

```ts
app.post('/login', c => {
  return c.unauth();
});
```

### `c.bizerr(data?, msg?)`

Business error response

- **Status Code**: 5000
- **Usage**: Business logic errors (such as duplicate accounts, insufficient inventory, etc.)

```ts
app.post('/register', async c => {
  const { name } = await c.req.json();
  return c.bizerr({ name }, `Username ${name} already exists`);
});
```

### `c.syserr(data?, msg?)`

System error response

- **Status Code**: 5100
- **Usage**: System-level errors (such as database connection failure, processing exceptions, etc.)

```ts
app.post('/foo', c => {
  try {
    // do something
  } catch (error) {
    return c.syserr(error);
  }
});
```

### `c.jr(code, data?, msg?)`

Custom response code

- **Parameter**: code - Custom status code
- **Usage**: Some complex interfaces may need to return more status codes to represent different business logic

```ts
app.get('/orders/:id', async c => {
  const orderId = c.req.param('id');

  try {
    const order = await getOrderById(orderId);

    // Order not found
    if (!order) {
      return c.jr(5000, null, 'Order not found');
    }

    // No permission to access other user's order
    if (order.userId !== userId) {
      return c.jr(5001, null, 'No permission to access this order');
    }

    // Order has been deleted
    if (order.status === 'deleted') {
      return c.jr(5002, null, 'Order has been deleted');
    }
    // More business logic...

    return c.ok(order, 'Get order details successfully');
  } catch (error) {
    return c.syserr(null, 'Failed to get order details');
  }
});
```

## Custom Configuration

### Override Default Configuration

```typescript
app.use(
  '*',
  jsonResponse({
    ok: { code: 20000, defaultMsg: 'Override ok' },
    unauth: { code: 40000, defaultMsg: 'Override unauth' }
  })
);
```

### Add Custom Methods

```typescript
import type { JSONResponseHandler } from 'hono-json-response';

// Don't forget to use TypeScript module augmentation to extend Context type
declare module 'hono' {
  interface Context {
    warning: JSONResponseHandler;
    forbidden: JSONResponseHandler;
  }
}

app.use(
  '*',
  jsonResponse({
    warning: { code: 2001, defaultMsg: 'Warning message' },
    forbidden: { code: 4001, defaultMsg: 'Access forbidden' }
  })
);

app.get('/warning', c => {
  return c.warning(data, 'API will be deprecated');
});
```

### Handle Status Code Conflicts

When custom method status codes conflict with default methods, default methods will be automatically removed:

```typescript
app.use(
  '*',
  jsonResponse({
    mySuccess: { code: 2000 } // Conflicts with default ok method
  })
);

// At this point, c.ok method is no longer available, only c.mySuccess is available
```

## License

[MIT](./LICENSE)

Copyright (c) 2025-present, Zhifeng (Jeff) Wang
