import pathToRegexp from 'path-to-regexp';

interface BootOptions {
  proxy?: boolean;
  prependServerURL?: boolean;
  noPolyfill?: boolean;
  host?: string;
  port?: number;
  portHttps?: number;
  suiteHeader?: string;
  suiteCookie?: string;
  ignorePrefix?: string;
  fetch?: GlobalFetch['fetch'];
  aliases?: string[][];
  responseHeaders?: boolean;
  fileResolver?: (filePath: string) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  fixtureResolver?: (filePath: string) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

type MethodLower = 'get' | 'put' | 'delete' | 'post' | 'options' | 'patch';
type MethodUpper = 'GET' | 'PUT' | 'DELETE' | 'POST' | 'OPTIONS' | 'PATCH';
type Method = MethodLower | MethodUpper;

type MethodOrAll = Method | 'all' | 'ALL' | '*';

// TODO: Better JSON type.
type JSON = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

interface RequestForHandler {
  url: string;
  path?: string;
  method: Method;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

type ResponderResult<T> = T | Promise<T>;

type ResponderFunction<T> =
  | ((arg: RequestForHandler) => T)
  | ((arg: RequestForHandler) => Promise<T>);

type Responder<T> = ResponderResult<T> | ResponderFunction<T>;

interface ResponseOptionsObject {
  json?: Responder<JSON>;
  text?: Responder<string>;
  html?: Responder<string>;
  raw?: Responder<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  filePath: Responder<string>;
  fixture: Responder<string>;
  status?: Responder<number>;
  type?: Responder<string>;
  latency?: Responder<number>;
  headers: Record<string, string>;
}

const responseOptionsKeys = [
  'fixture',
  'filePath',
  'html',
  'json',
  'text',
  'status',
  'headers',
  'raw',
  'latency',
  'type'
];

type ResponseOptions = string | ResponseOptionsObject;

type Matcher<T> = T | ((arg: T) => boolean | undefined);
type MatchString<T = string> = Matcher<T> | RegExp;

type VerifyCallback = (err?: Error) => void;
type RunHandler = (callback: (err?: Error) => void) => Promise<void> | void;
type RunHandlerOrPromise = RunHandler | Promise<void>;

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
  // TODO: Type out `body`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // expectation?: Expectation;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectation?: any;
}

interface MatchObject {
  url?: MatchString<string>;
  path?: MatchString<string>;
  method?: MatchString<MethodOrAll>;
  query?: Matcher<Record<string, MatchString>>;
  headers?: Matcher<Record<string, MatchString>>;
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
type MatchNormal = MatchObject | MatchFunction;
type Match = string | RegExp | MatchNormal;

type Mock = [Match, ResponseOptions];

type MockNormal = [MatchNormal, ResponseOptionsObject];

interface FetchOptions {
  dynamicMocks?: Mock[];
  proxy?: boolean;
}

export {
  BootOptions,
  FetchOptions,
  Method,
  MethodOrAll,
  ResponseOptions,
  ResponseOptionsObject,
  Responder,
  ResponderFunction,
  ResponderResult,
  Matcher,
  Match,
  MatchFunction,
  MatchObject,
  MatchString,
  Mock,
  MockNormal,
  RequestForHandler,
  responseOptionsKeys,
  Expectation,
  VerifyCallback,
  RunHandler,
  RunHandlerOrPromise
};
