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
  fileResolver?: (filePath: string) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  fixtureResolver?: (filePath: string) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  mockSuiteResolver?: MockSuiteResolver;
  devTools?: boolean;
  devToolsTimeout?: number;
  devToolsInterval?: number;
}

type MethodLower = 'get' | 'put' | 'delete' | 'post' | 'options' | 'patch';
type MethodUpper = 'GET' | 'PUT' | 'DELETE' | 'POST' | 'OPTIONS' | 'PATCH';
type Method = MethodLower | MethodUpper;

type MethodOrAll = Method | 'all' | 'ALL' | '*';

interface JsonObject {
  [key: string]: Json;
}
type JsonPrimitive = string | number | boolean | null;
type Json = JsonPrimitive | JsonPrimitive[] | JsonObject;

interface RequestForHandler {
  url: string;
  path?: string;
  method: Method;
  query?: DeepObjectOfStrings;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

interface ResponseObject {
  status?: number;
  headers?: Record<string, string>;
  body?: any;
}

type ResponderResult<T> = T | Promise<T>;

type ResponderFunction<T> =
  | ((req: RequestForHandler, res?: ResponseObject) => T)
  | ((req: RequestForHandler, res?: ResponseObject) => Promise<T>);

type Responder<T> = ResponderResult<T> | ResponderFunction<T>;

interface ResponseOptionsObject {
  json?: Responder<Json>;
  text?: Responder<string>;
  html?: Responder<string>;
  raw?: Responder<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  filePath?: Responder<string>;
  fixture?: Responder<string>;
  status?: Responder<number>;
  type?: Responder<string>;
  latency?: Responder<number>;
  headers?: Responder<Record<string, string>>;
}

const responseOptionsResponderKeys = [
  'json',
  'text',
  'html',
  'raw',
  'filePath',
  'fixture',
  'status',
  'type',
  'latency',
  'headers'
];

type ResponseOptions = string | ResponseOptionsObject;

type MatcherFunction<T> = (arg: T) => boolean | undefined;
type Matcher<T> = T | MatcherFunction<T>;
type MatchString<T = string> = Matcher<T> | RegExp;

type VerifyCallback = (err?: Error) => void;
type RunHandler = (callback: (err?: Error) => void) => Promise<void> | void;
type RunHandlerOrPromise = RunHandler | Promise<void>;

interface DeepObjectOfStrings {
  [key: string]: string | DeepObjectOfStrings;
}

interface MatchDeepObjectOfStrings {
  [key: string]: MatchString | MatchDeepObjectOfStrings;
}

type MatcherDeepObjectOfStrings = MatchDeepObjectOfStrings | MatcherFunction<DeepObjectOfStrings>;

type ObjectOfStrings = Record<string, string>;

type MatchObjectOfStrings = Record<string, MatchString>;

type MatcherObjectOfStrings = MatchObjectOfStrings | MatcherFunction<ObjectOfStrings>;

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
  // TODO: Type out `body`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  originalSerialized?: MatchObject; // technically we could replace regex types here
  expectation?: Expectation;
}

interface MatchObject {
  url?: MatchString & { toStringForMatchDeep?: () => string | undefined };
  path?: MatchString;
  method?: MatchString<MethodOrAll>;
  query?: MatcherDeepObjectOfStrings;
  headers?: MatcherObjectOfStrings;
  cookies?: MatcherObjectOfStrings;
  // TODO: Type out `body`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  status?: Matcher<number>;
  $meta?: MatchMeta;
}

interface MatchFunction {
  (req: RequestForHandler): boolean;
  $meta?: MatchMeta;
}
type MatchNormal =
  | (MatchObject & {
      url(value: string): boolean;
    })
  | MatchFunction;
type Match = string | RegExp | MatchObject | MatchFunction;

type Mock = [Match, ResponseOptions];

type MockSuite = Mock[];

type MockSuiteResolver = (suiteName: string) => Promise<MockSuite & { default?: MockSuite }>;

type MockNormal = [MatchNormal, ResponseOptionsObject];

interface MockReturn {
  id: string;
  removedIds: string[];
  expect(match: Match): Expectation;
}

type MockFunction = (match: Match, res?: ResponseOptions) => MockReturn;

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

export {
  Json,
  BootOptions,
  FetchOptions,
  Method,
  MethodOrAll,
  ResponseOptions,
  ResponseOptionsObject,
  Responder,
  ResponderFunction,
  ResponderResult,
  ResponseObject,
  Matcher,
  MatcherDeepObjectOfStrings,
  MatcherObjectOfStrings,
  Match,
  MatchFunction,
  MatchObject,
  MatchString,
  MatchNormal,
  Mock,
  MockSuite,
  MockSuiteResolver,
  MockNormal,
  MockFunction,
  MockReturn,
  RequestForHandler,
  Expectation,
  VerifyCallback,
  RunHandler,
  RunHandlerOrPromise,
  Action,
  MakeMockOptions,
  MakeMockReturn,
  responseOptionsResponderKeys
};
