import pathToRegexp from 'path-to-regexp';
interface BootOptions {
    name?: string;
    noProxy?: boolean;
    prependServerURL?: boolean;
    noPolyfill?: boolean;
    noWebSocket?: boolean;
    webSocketReconnectInterval?: number;
    host?: string;
    port?: number;
    adminHost?: string;
    adminPort?: number;
    portHttps?: number;
    suiteHeader?: string;
    suiteCookie?: string;
    ignorePrefix?: string;
    latency?: Responder<number>;
    fetch?: WindowOrWorkerGlobalScope['fetch'];
    aliases?: string[][];
    responseHeaders?: boolean;
    fileResolver?: (filePath: string) => Promise<any>;
    fixtureResolver?: (filePath: string) => Promise<any>;
    mockSuiteResolver?: MockSuiteResolver;
}
interface ConnectWebSocketOptions {
    retries?: number;
}
declare type MethodLower = 'get' | 'put' | 'delete' | 'post' | 'options' | 'patch';
declare type MethodUpper = 'GET' | 'PUT' | 'DELETE' | 'POST' | 'OPTIONS' | 'PATCH';
declare type Method = MethodLower | MethodUpper;
declare type MethodOrAll = Method | 'all' | 'ALL' | '*';
declare type Json = Record<string, any>;
interface RequestForHandler {
    url: string;
    path?: string;
    method: Method;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    body?: any;
}
declare type ResponderResult<T> = T | Promise<T>;
declare type ResponderFunction<T> = ((arg: RequestForHandler) => T) | ((arg: RequestForHandler) => Promise<T>);
declare type Responder<T> = ResponderResult<T> | ResponderFunction<T>;
interface ResponseOptionsObject {
    json?: Responder<Json>;
    text?: Responder<string>;
    html?: Responder<string>;
    raw?: Responder<any>;
    filePath?: Responder<string>;
    fixture?: Responder<string>;
    status?: Responder<number>;
    type?: Responder<string>;
    latency?: Responder<number>;
    headers?: Record<string, string>;
}
declare const responseOptionsKeys: string[];
declare type ResponseOptions = string | ResponseOptionsObject;
declare type Matcher<T> = T | ((arg: T) => boolean | undefined);
declare type MatchString<T = string> = Matcher<T> | RegExp;
declare type VerifyCallback = (err?: Error) => void;
declare type RunHandler = (callback: (err?: Error) => void) => Promise<void> | void;
declare type RunHandlerOrPromise = RunHandler | Promise<void>;
interface Expectation {
    request(request: RequestForHandler): void;
    api(match: MatchObject): Expectation;
    atLeast(num: number): Expectation;
    atMost(num: number): Expectation;
    never(): Expectation;
    once(): Expectation;
    twice(): Expectation;
    thrice(): Expectation;
    exactly(number: number): Expectation;
    path(path: string): Expectation;
    url(url: string): Expectation;
    header(name: string, value: string): Expectation;
    params(match: Matcher<Record<string, MatchString>>): Expectation;
    query(match: Matcher<Record<string, MatchString>>): Expectation;
    body(match: any): Expectation;
    verifier(fn: () => void): (err?: Error) => void;
    run(handlerOrPromise: RunHandlerOrPromise): Expectation;
    verify(callback: VerifyCallback): void;
}
interface MatchMeta {
    fn?: string;
    regex?: RegExp;
    matchKeys?: pathToRegexp.Key[];
    original?: Match;
    originalNormal?: MatchObject;
    expectation?: Expectation;
}
interface MatchObject {
    url?: MatchString<string>;
    path?: MatchString<string>;
    method?: MatchString<MethodOrAll>;
    query?: Matcher<Record<string, MatchString>>;
    headers?: Matcher<Record<string, MatchString>>;
    cookies?: Matcher<Record<string, MatchString>>;
    body?: any;
    status?: Matcher<number>;
    $meta?: MatchMeta;
}
interface MatchFunction {
    (req: RequestForHandler): boolean;
    $meta?: MatchMeta;
}
declare type MatchNormal = (MatchObject & {
    url(value: string): boolean;
}) | MatchFunction;
declare type Match = string | RegExp | MatchObject | MatchFunction;
declare type Mock = [Match, ResponseOptions];
declare type MockSuite = Mock[];
declare type MockSuiteResolver = (suiteName: string) => Promise<{
    default: MockSuite;
}>;
declare type MockNormal = [MatchNormal, ResponseOptionsObject];
interface MockReturn {
    expect(match: Match): Expectation;
}
declare type MockFunction = (match: Match, res?: ResponseOptions) => MockReturn;
interface FetchOptions {
    dynamicMocks?: Mock[];
    dynamicMockSuite?: string;
    noProxy?: boolean;
}
interface Action {
    type?: string;
    payload?: Record<string, any>;
}
export { Json, BootOptions, ConnectWebSocketOptions, FetchOptions, Method, MethodOrAll, ResponseOptions, ResponseOptionsObject, Responder, ResponderFunction, ResponderResult, Matcher, Match, MatchFunction, MatchObject, MatchString, MatchNormal, Mock, MockSuite, MockSuiteResolver, MockNormal, MockFunction, MockReturn, RequestForHandler, responseOptionsKeys, Expectation, VerifyCallback, RunHandler, RunHandlerOrPromise, Action };
