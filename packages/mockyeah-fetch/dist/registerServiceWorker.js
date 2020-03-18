"use strict";
exports.__esModule = true;
var registerServiceWorker = function (_a) {
    var url = _a.url, scope = _a.scope;
    if (typeof navigator === 'undefined')
        return;
    navigator.serviceWorker
        .register(url, { scope: scope })
        .then(function (reg) {
        // registration worked
        console.log('@mockyeah/fetch service worker registration succeeded.');
    })["catch"](function (error) {
        // registration failed
        console.log('@mockyeah/fetch service worker registration failed.', error);
    });
};
exports.registerServiceWorker = registerServiceWorker;
var postMessageToServiceWorker = function (message) {
    var _a;
    if (typeof navigator === 'undefined')
        return;
    if (!((_a = navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.controller))
        return;
    try {
        navigator.serviceWorker.controller.postMessage(message);
    }
    catch (error) {
        console.error(error);
    }
};
exports.postMessageToServiceWorker = postMessageToServiceWorker;
