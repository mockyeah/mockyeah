declare const matchCb: ({ event }: {
    event: any;
}) => boolean;
declare const handlerCb: ({ event }: {
    event: any;
}) => Response | Promise<Response>;
export { matchCb, handlerCb };
