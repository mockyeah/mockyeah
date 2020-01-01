import mime from 'mime';
import {
  MockNormal,
  ResponseOptionsObject,
  Responder,
  ResponderFunction,
  RequestForHandler,
  BootOptions,
  Json
} from './types';

const handler = <T>(value: Responder<T>, requestForHandler: RequestForHandler): T | Promise<T> =>
  typeof value === 'function' ? (value as ResponderFunction<T>)(requestForHandler) : value;

interface Respond {
  response: Response;
  json?: Json;
}

const respond = async (
  matchingMock: MockNormal,
  requestForHandler: RequestForHandler,
  options: BootOptions
): Promise<Respond> => {
  const { responseHeaders } = options;

  const resOpts: ResponseOptionsObject = matchingMock[1] || {};

  const status =
    (resOpts.status && (await handler<number>(resOpts.status, requestForHandler))) || 200;

  let body;
  const awaitedType = (resOpts.type && (await resOpts.type)) as
    | string
    | ((req: RequestForHandler) => string)
    | undefined;

  let type: string | undefined;

  if (typeof awaitedType === 'function') {
    type = awaitedType(requestForHandler) as string | undefined;
  } else {
    type = awaitedType;
  }

  let contentType: string | null | undefined;

  let json;

  if (resOpts.fixture) {
    if (!options.fixtureResolver) {
      throw new Error('Using `fixture` in mock response options requires a `fixtureResolver`.');
    }
    const fixture = await handler<string>(resOpts.fixture, requestForHandler);
    type = type || fixture; // TODO: Use base name only to conceal file path?
    body = fixture ? await options.fixtureResolver(fixture) : undefined;
  } else if (resOpts.filePath) {
    if (!options.fileResolver) {
      throw new Error('Using `filePath` in mock response options requires a `fileResolver`.');
    }
    const filePath = await handler<string>(resOpts.filePath, requestForHandler);
    type = type || filePath; // TODO: Use base name only to conceal file path?
    body = filePath ? await options.fileResolver(filePath) : undefined;
  } else if (resOpts.json) {
    json = await handler(resOpts.json, requestForHandler);
    body = JSON.stringify(json);
    contentType = 'application/json; charset=UTF-8';
  } else if (resOpts.text) {
    body = await handler(resOpts.text, requestForHandler);
    contentType = 'text/plain; charset=UTF-8';
  } else if (resOpts.html) {
    body = await handler(resOpts.html, requestForHandler);
    contentType = 'text/html; charset=UTF-8';
  } else if (resOpts.raw) {
    // TODO: This has different semantics that the Express version.
    body = await handler(resOpts.raw, requestForHandler);
    contentType = undefined;
  }

  body = body || '';

  contentType = type ? mime.getType(type) : contentType;

  const headers: RequestInit['headers'] = resOpts.headers
    ? {
        ...(await handler<Record<string, string>>(resOpts.headers, requestForHandler))
      }
    : {};

  if (responseHeaders) {
    headers['x-mockyeah-mocked'] = 'true';
  }

  if (contentType) {
    headers['content-type'] = contentType;
  }

  const responseInit = {
    status,
    headers
  };

  const latency = resOpts.latency || options.latency;

  if (latency) {
    const latencyActual = await handler<number>(latency, requestForHandler);
    await new Promise(resolve => setTimeout(resolve, latencyActual));
  }

  const response = new Response(body, responseInit);

  // eslint-disable-next-line consistent-return
  return {
    response,
    json
  };
};

export { respond };
