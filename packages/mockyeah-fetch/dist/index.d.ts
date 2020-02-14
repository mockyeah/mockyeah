import { BootOptions, FetchOptions, MockFunction, MockReturn, Match, ResponseOptions, MakeMockOptions, MakeMockReturn } from './types';
declare class Mockyeah {
    private __private;
    methods: Record<string, MockFunction>;
    constructor(bootOptions?: Readonly<BootOptions>);
    fetch(input: RequestInfo, init?: RequestInit, fetchOptions?: FetchOptions): Promise<Response>;
    fallbackFetch(input: RequestInfo, init?: RequestInit, fetchOptions?: FetchOptions): Promise<any>;
    expect(match: Match): import("./types").Expectation;
    all(match: Match, res?: ResponseOptions): MockReturn;
    get(match: Match, res?: ResponseOptions): MockReturn;
    post(match: Match, res?: ResponseOptions): MockReturn;
    put(match: Match, res?: ResponseOptions): MockReturn;
    delete(match: Match, res?: ResponseOptions): MockReturn;
    options(match: Match, res?: ResponseOptions): MockReturn;
    patch(match: Match, res?: ResponseOptions): MockReturn;
    reset(): void;
    makeMock(match: Match, res?: ResponseOptions, options?: MakeMockOptions): MakeMockReturn;
    mock(match: Match, res?: ResponseOptions): MockReturn;
    /**
     * Returns true if unmocked, false if not.
     * @param id
     */
    unmock(id: string): boolean;
    connectWebSocket(): Promise<void>;
}
export default Mockyeah;
