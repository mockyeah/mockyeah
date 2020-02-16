// eslint-disable-next-line spaced-comment
/// <reference lib="webworker" />
import {
  ResponseObject,
  ActionMockyeahServiceWorkerDataRequest,
  ActionMockyeahServiceWorkerDataResponse
} from './types';

const PROMISE_GC_TIMEOUT = 120000; // two minutes

interface PromiseCache {
  resolve({ response }: { response: ResponseObject }): void;
  reject(): void;
  timestamp: number;
}

const promises: Record<string, Record<string, PromiseCache>> = {};

// eslint-disable-next-line no-restricted-globals
self.addEventListener('message', ((event: ExtendableMessageEvent) => {
  const { source, data } = event as { source: Client; data: any };

  if (!source) return;

  const { id: clientId } = source;

  if (!clientId) return;

  if (data && data.type === 'mockyeahServiceWorkerDataResponse') {
    const { requestId, response } =
      (data.payload as ActionMockyeahServiceWorkerDataResponse['payload']) || {};

    if (!requestId) return;
    if (!response) return;

    promises[clientId] = promises[clientId] || {};
    const promise = promises[clientId][requestId];

    if (!promise) return;

    promise.resolve({
      response
    });
  }
}) as (event: Event) => void);

const matchCb = ({ event }: { event: FetchEvent }): boolean => {
  try {
    return Boolean(event.request.headers.get('x-mockyeah-service-worker-request'));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('@mockyeah/fetch service worker match error', error);
    return false;
  }
};

const handlerCb = ({ event }: { event: FetchEvent }): Response | Promise<Response> => {
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

    if (!requestId) {
      return fetch(event.request);
    }

    const promise = new Promise<{ response: ResponseObject }>((resolve, reject) => {
      promises[clientId] = promises[clientId] || {};
      promises[clientId][requestId] = {
        resolve,
        reject,
        timestamp: Date.now()
      };
    });

    // eslint-disable-next-line no-restricted-globals
    // @ts-ignore
    // eslint-disable-next-line no-restricted-globals
    return self.clients.get(clientId).then((client: Client) => {
      const action: ActionMockyeahServiceWorkerDataRequest = {
        type: 'mockyeahServiceWorkerDataRequest',
        payload: { requestId }
      };

      client.postMessage(action);

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
