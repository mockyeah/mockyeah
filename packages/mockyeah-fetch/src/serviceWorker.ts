// @ts-nocheck
// // eslint-disable-next-line spaced-comment
// /// <reference lib="webworker" />
import { handlerCb, matchCb } from './workbox';

// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', ((event: FetchEvent) => {
  const matches = matchCb({ event });

  if (!matches) {
    event.respondWith(fetch(event.request));
    return;
  }

  const response = handlerCb({ event });

  event.respondWith(response);
}) as (event: Event) => void);
