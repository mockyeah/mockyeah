import { MockNormal, RequestForHandler, BootOptions, Json } from './types';
interface Respond {
    response: Response;
    json?: Json;
}
declare const respond: (matchingMock: MockNormal, requestForHandler: RequestForHandler, options: BootOptions) => Promise<Respond>;
export { respond };
