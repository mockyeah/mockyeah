import mime from 'mime';
import {
  MockNormal,
  ResponseOptionsObject,
  Responder,
  ResponderFunction,
  RequestForHandler,
  BootOptions,
  Json,
  ResponseObject
} from './types';

const handler = <T>(
  value: Responder<T>,
  requestForHandler: RequestForHandler,
  res?: ResponseObject
): T | Promise<T> =>
  typeof value === 'function' ? (value as ResponderFunction<T>)(requestForHandler, res) : value;

interface Respond {
  response: Response;
  body?: string;
  json?: Json;
  headers?: Record<string, string>;
}

const respond = async (
  matchingMock: MockNormal,
  requestForHandler: RequestForHandler,
  bootOptions: BootOptions,
  res?: ResponseObject
): Promise<Respond> => {
  const { responseHeaders, fixtureResolver, fileResolver } = bootOptions;

  const resOpts: ResponseOptionsObject = matchingMock[1] || {};

  const { name } = resOpts;

  const status =
    (resOpts.status && (await handler<number>(resOpts.status, requestForHandler, res))) || 200;

  let body;

  let type: string | undefined =
    resOpts.type && (await handler<string>(resOpts.type, requestForHandler, res));

  let contentType: string | null | undefined;

  let json;

  let fixture: string | undefined;
  let filePath: string | undefined;

  if (resOpts.fixture) {
    if (!fixtureResolver) {
      throw new Error('Using `fixture` in mock response options requires a `fixtureResolver`.');
    }
    fixture = await handler<string>(resOpts.fixture, requestForHandler, res);
    type = type || fixture; // TODO: Use base name only to conceal file path?
    body = fixture ? await fixtureResolver(fixture) : undefined;

    if (type.includes('json')) {
      try {
        json = JSON.parse(body);
      } catch (error) {
        // silence
      }
    }
  } else if (resOpts.filePath) {
    if (!fileResolver) {
      throw new Error('Using `filePath` in mock response options requires a `fileResolver`.');
    }
    filePath = await handler<string>(resOpts.filePath, requestForHandler, res);
    type = type || filePath; // TODO: Use base name only to conceal file path?
    body = filePath ? await fileResolver(filePath) : undefined;

    if (type.includes('json')) {
      try {
        json = JSON.parse(body);
      } catch (error) {
        // silence
      }
    }
  } else if (resOpts.json) {
    json = await handler(resOpts.json, requestForHandler, res);
    body = JSON.stringify(json);
    contentType = 'application/json; charset=UTF-8';
  } else if (resOpts.text) {
    body = await handler(resOpts.text, requestForHandler, res);
    contentType = 'text/plain; charset=UTF-8';
  } else if (resOpts.html) {
    body = await handler(resOpts.html, requestForHandler, res);
    contentType = 'text/html; charset=UTF-8';
  } else if (resOpts.raw) {
    // TODO: This has different semantics than the Express version.
    body = await handler(resOpts.raw, requestForHandler, res);
    contentType = undefined;
  }

  body = body || '';

  contentType = type ? mime.getType(type) || type : contentType;

  const latency = resOpts.latency || bootOptions.latency;

  let latencyActual: number | undefined;
  if (latency) {
    latencyActual = await handler<number>(latency, requestForHandler, res);
    await new Promise(resolve => setTimeout(resolve, latencyActual));
  }

  const headers: RequestInit['headers'] = resOpts.headers
    ? {
        ...(await handler<Record<string, string>>(resOpts.headers, requestForHandler, res))
      }
    : {};

  if (responseHeaders) {
    headers['x-mockyeah-mocked'] = 'true';

    if (name) {
      headers['x-mockyeah-name'] = name;
    }

    if (fixture) {
      headers['x-mockyeah-fixture'] = fixture;
    }

    if (filePath) {
      headers['x-mockyeah-filePath'] = filePath;
    }

    if (latencyActual) {
      headers['x-mockyeah-latency'] = latencyActual.toString();
    }
  }

  if (contentType) {
    headers['content-type'] = contentType;
  }

  const responseInit = {
    status,
    headers
  };

  const response = new Response(body, responseInit);

  // eslint-disable-next-line consistent-return
  return {
    response,
    body,
    headers,
    json
  };
};

export { respond };
