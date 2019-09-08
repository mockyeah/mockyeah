import mime from 'mime';
import { MockNormal, ResponseOptionsObject, RequestForHandler, BootOptions } from './types';

const handler = (value: any, requestForHandler: RequestForHandler) =>
  typeof value === 'function' ? value(requestForHandler) : value;

const respond = async (
  matchingMock: MockNormal,
  requestForHandler: RequestForHandler,
  options: BootOptions
): Promise<Response> => {
  const { responseHeaders } = options;

  const resOpts: ResponseOptionsObject = matchingMock[1];

  const status = (await handler(resOpts.status, requestForHandler)) || 200;

  let body;
  let contentType: string | null | undefined;

  if (resOpts.json) {
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

  // TODO: Handle all `responseOptionsKeys`, including `fixture`, `filePath`.

  body = body || '';
  contentType = resOpts.type ? mime.getType(resOpts.type) : contentType;

  const headers: RequestInit['headers'] = {
    ...resOpts.headers
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
    await new Promise(resolve => setTimeout(resolve, resOpts.latency));
  }

  // eslint-disable-next-line consistent-return
  return new Response(body, responseInit);
};

export { respond };
