import pathToRegexp from 'path-to-regexp';
interface BootOptions {
    name?: string;
    noProxy?: boolean;
    prependServerURL?: boolean;
    noPolyfill?: boolean;
    noWebSocket?: boolean;
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
    devTools?: boolean;
    devToolsTimeout?: number;
    devToolsInterval?: number;
    serviceWorker?: boolean;
    serviceWorkerRegister?: boolean;
    serviceWorkerURL?: string;
    serviceWorkerScope?: string;
}
declare type MethodLower = 'get' | 'put' | 'delete' | 'post' | 'options' | 'patch';
declare type MethodUpper = 'GET' | 'PUT' | 'DELETE' | 'POST' | 'OPTIONS' | 'PATCH';
declare type Method = MethodLower | MethodUpper;
declare type MethodOrAll = Method | 'all' | 'ALL' | '*';
interface JsonObject {
    [key: string]: Json;
}
declare type JsonPrimitive = string | number | boolean | null;
declare type Json = JsonPrimitive | JsonPrimitive[] | JsonObject;
interface RequestForHandler {
    url: string;
    path?: string;
    method: Method;
    query?: DeepObjectOfStrings;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    body?: any;
}
interface ResponseObject {
    status?: number;
    headers?: Record<string, string>;
    body?: any;
}
declare type ResponderResult<T> = T | Promise<T>;
declare type ResponderFunction<T> = ((req: RequestForHandler, res?: ResponseObject) => T) | ((req: RequestForHandler, res?: ResponseObject) => Promise<T>);
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
    headers?: Responder<Record<string, string>>;
}
declare const responseOptionsResponderKeys: string[];
declare type ResponseOptions = string | ResponseOptionsObject;
declare type MatcherFunction<T> = (arg: T) => boolean | undefined;
declare type Matcher<T> = T | MatcherFunction<T>;
declare type MatchString<T = string> = Matcher<T> | RegExp;
declare type VerifyCallback = (err?: Error) => void;
declare type RunHandler = (callback: (err?: Error) => void) => Promise<void> | void;
declare type RunHandlerOrPromise = RunHandler | Promise<void>;
interface DeepObjectOfStrings {
    [key: string]: string | DeepObjectOfStrings;
}
interface MatchDeepObjectOfStrings {
    [key: string]: MatchString | MatchDeepObjectOfStrings;
}
declare type MatcherDeepObjectOfStrings = MatchDeepObjectOfStrings | MatcherFunction<DeepObjectOfStrings>;
declare type ObjectOfStrings = Record<string, string>;
declare type MatchObjectOfStrings = Record<string, MatchString>;
declare type MatcherObjectOfStrings = MatchObjectOfStrings | MatcherFunction<ObjectOfStrings>;
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
    params(match: MatcherDeepObjectOfStrings): Expectation;
    query(match: MatcherDeepObjectOfStrings): Expectation;
    body(match: any): Expectation;
    verifier(fn: () => void): (err?: Error) => void;
    run(handlerOrPromise: RunHandlerOrPromise): Expectation;
    verify(callback: VerifyCallback): void;
}
interface MatchMeta {
    id?: string;
    fn?: string;
    regex?: RegExp;
    matchKeys?: pathToRegexp.Key[];
    original?: Match;
    originalNormal?: MatchObject;
    originalSerialized?: MatchObject;
    expectation?: Expectation;
}
interface MatchObject {
    url?: MatchString & {
        toStringForMatchDeep?: () => string | undefined;
    };
    path?: MatchString;
    method?: MatchString<MethodOrAll>;
    query?: MatcherDeepObjectOfStrings;
    headers?: MatcherObjectOfStrings;
    cookies?: MatcherObjectOfStrings;
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
declare type MockSuiteResolver = (suiteName: string) => Promise<MockSuite & {
    default?: MockSuite;
}>;
declare type MockNormal = [MatchNormal, ResponseOptionsObject];
interface MockReturn {
    id: string;
    removedIds: string[];
    expect(match: Match): Expectation;
}
declare type MockFunction = (match: Match, res?: ResponseOptions) => MockReturn;
interface MakeMockOptions {
    keepExisting?: boolean;
}
interface MakeMockReturn {
    mock: MockNormal;
    removed: MockNormal[];
    removedIndex?: number;
}
interface FetchOptions {
    dynamicMocks?: Mock[];
    dynamicMockSuite?: string;
    noProxy?: boolean;
}
interface Action {
    type?: string;
    payload?: Record<string, any>;
}
export { Json, BootOptions, FetchOptions, Method, MethodOrAll, ResponseOptions, ResponseOptionsObject, Responder, ResponderFunction, ResponderResult, ResponseObject, Matcher, MatcherDeepObjectOfStrings, MatcherObjectOfStrings, Match, MatchFunction, MatchObject, MatchString, MatchNormal, Mock, MockSuite, MockSuiteResolver, MockNormal, MockFunction, MockReturn, RequestForHandler, Expectation, VerifyCallback, RunHandler, RunHandlerOrPromise, Action, MakeMockOptions, MakeMockReturn, responseOptionsResponderKeys };
