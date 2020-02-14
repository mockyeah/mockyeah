// @ts-nocheck

const clientsMeta = {};

const deleteRequest = ({ event }): void => {
  const { request, clientId } = event;

  const requestId = request.headers.get('x-mockyeah-service-worker-request');

  const clientMeta = clientsMeta[clientId];

  if (!clientMeta) {
    return;
  }

  const { requests } = clientMeta;

  if (!requests) {
    return;
  }

  delete requests[requestId];

  if (Object.keys(requests).length === 0) {
    delete clientMeta[clientId];
  }
};

const getRequest = ({ event }) => {
  const { request, clientId } = event;

  if (!request.headers) {
    return;
  }

  const requestId = request.headers.get('x-mockyeah-service-worker-request');

  const clientMeta = clientsMeta[clientId];

  if (!clientMeta) {
    return;
  }

  const { requests } = clientMeta;

  if (!requests) {
    return;
  }

  // eslint-disable-next-line consistent-return
  return requests[requestId];
};

const matchCb = ({ event }: { event: FetchEvent }): boolean => {
  try {
    return Boolean(getRequest({ event }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('@mockyeah/fetch service worker match error', error);
    return false;
  }
};

const handlerCb = ({ event }): Response | Promise<Response> => {
  try {
    const request = getRequest({ event });

    const {
      response: { status, body, headers }
    } = request;

    const response = new Response(body, {
      status,
      headers
    });

    deleteRequest({ event });

    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('@mockyeah/fetch service worker handler error', error);
    return fetch(event.request);
  }
};

// eslint-disable-next-line no-restricted-globals
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'mockyeahRequest') {
    const { data: { payload: { requestId, request, response } } = {}, source: client } = event;

    if (!requestId) return;

    clientsMeta[client.id] = clientsMeta[client.id] || {};
    const clientMeta = clientsMeta[client.id];

    clientMeta.requests = clientMeta.requests || {};
    const { requests } = clientsMeta[client.id];

    requests[requestId] = {
      request,
      response
    };

    client.postMessage({ type: 'mockyeahRequestReady', payload: { requestId } });
  }
});

export { matchCb, handlerCb };
