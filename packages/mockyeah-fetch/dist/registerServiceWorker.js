"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registerServiceWorker = ({ url, scope }) => {
    if (typeof navigator === 'undefined')
        return;
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
exports.registerServiceWorker = registerServiceWorker;
const postMessageToServiceWorker = (message) => {
    if (typeof navigator === 'undefined')
        return;
    if (!navigator.serviceWorker?.controller)
        return;
    try {
        navigator.serviceWorker.controller.postMessage(message);
    }
    catch (error) {
        console.error(error);
    }
};
exports.postMessageToServiceWorker = postMessageToServiceWorker;
//# sourceMappingURL=registerServiceWorker.js.map