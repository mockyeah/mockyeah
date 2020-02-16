// @ts-nocheck

const PROMISE_GC_TIMEOUT = 120000; // two minutes

const promises = {};

// eslint-disable-next-line no-restricted-globals
self.addEventListener('message', event => {
  const { source } = event;

  if (!source) return;

  const { id: clientId } = source;

  if (!clientId) return;

  if (event.data && event.data.type === 'mockyeahServiceWorkerDataResponse') {
    const { data: { payload: { requestId, response } } = {} } = event;

    if (!requestId) return;

    promises[clientId] = promises[clientId] || {};
    const promise = promises[clientId][requestId];

    if (!promise) return;

    promise.resolve({
      response
    });
  }
});

const matchCb = ({ event }: { event: FetchEvent }): boolean => {
  try {
    return Boolean(event.request.headers.get('x-mockyeah-service-worker-request'));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('@mockyeah/fetch service worker match error', error);
    return false;
  }
};

const handlerCb = ({ event }): Response | Promise<Response> => {
  try {
    // TODO: Add a cleanup routine to delete old promises based on timestamps.
    Object.entries(promises).forEach(([clientId, requests]) => {
      Object.entries(requests).forEach(([requestId, promise]) => {
        if (Date.now() - promise.timestamp > PROMISE_GC_TIMEOUT) {
          delete requests[requestId];
        }
      });
      if (Object.keys(requests).length === 0) {
        delete promises[clientId];
      }
    });

    const { request, clientId } = event;

    const requestId = request.headers.get('x-mockyeah-service-worker-request');

    const promise = new Promise((resolve, reject) => {
      promises[clientId] = promises[clientId] || {};
      promises[clientId][requestId] = {
        resolve,
        reject,
        timestamp: Date.now()
      };
    });

    // eslint-disable-next-line no-restricted-globals
    return self.clients.get(clientId).then(client => {
      client.postMessage({
        type: 'mockyeahServiceWorkerDataRequest',
        payload: { requestId }
      });

      return promise.then(({ response }) => {
        const { status, body, headers } = response;

        return new Response(body, {
          status,
          headers
        });
      });
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('@mockyeah/fetch service worker handler error', error);
    return fetch(event.request);
  }
};

export { matchCb, handlerCb };
