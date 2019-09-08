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
}

type MethodLower = 'get' | 'put' | 'delete' | 'post' | 'options' | 'patch';
type MethodUpper = 'GET' | 'PUT' | 'DELETE' | 'POST' | 'OPTIONS' | 'PATCH';
type Method = MethodLower | MethodUpper;

type MethodOrAll = Method | 'all' | 'ALL' | '*';

// TODO: Better JSON type.
type JSON = Record<string, any>;

interface RequestForHandler {
  url: string;
  path?: string;
  method: Method;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

type Responder<T> = T | ((arg: RequestForHandler) => T) | ((arg: RequestForHandler) => Promise<T>);

interface ResponseOptionsObject {
  json?: Responder<JSON>;
  text?: Responder<string>;
  html?: Responder<string>;
  raw?: Responder<string>; // TODO: Other raw types?
  status?: Responder<number>;
  // TODO: `filePath`?
  // TODO: `fixture`?
  type?: string;
  latency?: number;
  headers: Record<string, string>;
  onMatch(): void;
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

interface MatchMeta {
  fn?: string;
  regex?: RegExp;
  matchKeys?: pathToRegexp.Key[];
  original?: Match;
  originalNormal?: MatchObject;
  // expectation?: any;
}

interface MatchObject {
  url?: MatchString<string>;
  path?: MatchString<string>;
  method?: MatchString<MethodOrAll>;
  query?: Record<string, MatchString>;
  headers?: Record<string, MatchString>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  status?: Matcher<number>;
  $meta?: MatchMeta;
}

type Match = string | RegExp | MatchObject | ((url: string) => boolean);

type Mock = [Match, ResponseOptions];

type MockNormal = [MatchObject, ResponseOptionsObject];

export {
  BootOptions,
  Method,
  MethodOrAll,
  ResponseOptions,
  ResponseOptionsObject,
  Match,
  MatchObject,
  MatchString,
  Mock,
  MockNormal,
  RequestForHandler,
  responseOptionsKeys
};
