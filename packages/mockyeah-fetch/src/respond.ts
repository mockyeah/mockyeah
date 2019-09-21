import mime from 'mime';
import {
  MockNormal,
  ResponseOptionsObject,
  Responder,
  ResponderFunction,
  RequestForHandler,
  BootOptions
} from './types';

const handler = <T>(value: Responder<T>, requestForHandler: RequestForHandler) =>
  typeof value === 'function' ? (value as ResponderFunction<T>)(requestForHandler) : value;

const respond = async (
  matchingMock: MockNormal,
  requestForHandler: RequestForHandler,
  options: BootOptions
): Promise<Response> => {
  const { responseHeaders } = options;

  const resOpts: ResponseOptionsObject = matchingMock[1];

  const status =
    (resOpts.status && (await handler<number>(resOpts.status, requestForHandler))) || 200;

  let body;
  const awaitedType = (resOpts.type && (await resOpts.type)) as
    | string
    | ((req: RequestForHandler) => string)
    | undefined;

  let type: string | undefined;

  if (typeof awaitedType === 'function') {
    type = awaitedType(requestForHandler) as (string | undefined);
  } else {
    type = awaitedType;
  }

  let contentType: string | null | undefined;

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
    const json = await handler(resOpts.json, requestForHandler);
    // body = JSON.stringify(json, undefined, 2);
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

  const headers: RequestInit['headers'] = {
    ...(await handler<Record<string, string>>(resOpts.headers, requestForHandler))
  };

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

  if (resOpts.latency) {
    const latency = await handler<number>(resOpts.latency, requestForHandler);
    await new Promise(resolve => setTimeout(resolve, latency));
  }

  // eslint-disable-next-line consistent-return
  return new Response(body, responseInit);
};

export { respond };
