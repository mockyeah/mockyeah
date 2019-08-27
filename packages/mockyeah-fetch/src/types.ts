type MethodLower = 'get' | 'put' | 'delete' | 'post' | 'options';
type MethodUpper = 'GET' | 'PUT' | 'DELETE' | 'POST' | 'OPTIONS';
type Method = MethodLower | MethodUpper;

type MethodOrAll = Method | 'all' | 'ALL' | '*'

// TODO: Better JSON type.
type JSON = Record<string, any>;

interface RequestArg {
  url: string;
  path?: string;
  method: Method;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

type Responder<T> = T | ((arg: RequestArg) => T) | ((arg: RequestArg) => Promise<T>);

interface ResponseOptions {
  json?: Responder<JSON>;
  text?: Responder<string>;
  html?: Responder<string>;
  raw?: Responder<string>; // TODO: Other raw types?
  status?: Responder<number>;
  // TODO: `filePath`?
  // TODO: `fixture`?
}

type Matcher<T> = T | ((arg: T) => boolean | undefined)
type MatchString<T = string> = Matcher<T> | RegExp

interface MatchObject {
  url?: MatchString;
  path?: MatchString;
  method?: MatchString<MethodOrAll>;
  query?: Record<string, MatchString>;
  headers?: Record<string, MatchString>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  status?: Matcher<number>;
}

type Match = string | MatchObject;

type Mock = [Match, ResponseOptions];

export { Method, MethodOrAll, ResponseOptions, Match, MatchObject, MatchString, Mock };
