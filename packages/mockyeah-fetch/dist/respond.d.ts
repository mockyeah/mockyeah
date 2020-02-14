import { MockNormal, RequestForHandler, BootOptions, Json, ResponseObject } from './types';
interface Respond {
    response: Response;
    body?: string;
    json?: Json;
    headers?: Record<string, string>;
}
declare const respond: (matchingMock: MockNormal, requestForHandler: RequestForHandler, bootOptions: BootOptions, res?: ResponseObject | undefined) => Promise<Respond>;
export { respond };
