interface RegisterServiceWorkerOptions {
    url: string;
    scope: string;
}
declare const registerServiceWorker: ({ url, scope }: RegisterServiceWorkerOptions) => void;
declare const postMessageToServiceWorker: (message: any) => void;
export { postMessageToServiceWorker, registerServiceWorker };
