interface RegisterServiceWorkerOptions {
  url: string;
  scope: string;
}

const registerServiceWorker = ({ url, scope }: RegisterServiceWorkerOptions): void => {
  if (typeof navigator === 'undefined') return;

  navigator.serviceWorker
    .register(url, { scope })
    .then(reg => {
      // registration worked
      console.log('@mockyeah/fetch service worker registration succeeded.');
    })
    .catch(error => {
      // registration failed
      console.log('@mockyeah/fetch service worker registration failed.', error);
    });
};

const postMessageToServiceWorker = (message: any): void => {
  if (typeof navigator === 'undefined') return;
  if (!navigator.serviceWorker?.controller) return;

  try {
    navigator.serviceWorker.controller.postMessage(message);
  } catch (error) {
    console.error(error);
  }
};

export { postMessageToServiceWorker, registerServiceWorker };
