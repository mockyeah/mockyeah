import 'isomorphic-fetch';
import Mockyeah from '../index';

// @ts-ignore
global.fetch = jest.fn();
// @ts-ignore
window.fetch = global.fetch;

describe('@mockyeah/fetch', () => {
  let mockyeah;

  afterEach(() => {
    if (mockyeah) mockyeah.reset();
  });

  test('should work with new constructor', async () => {
    mockyeah = new Mockyeah();

    mockyeah.mock('https://example.local', { json: { a: 1 } });

    const response = await mockyeah.fetch('https://example.local');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should ignore prefix with defaults', async () => {
    mockyeah = new Mockyeah();

    mockyeah.mock('https://example.local', { json: { a: 2 } });

    const response = await mockyeah.fetch('http://localhost:4001/https://example.local');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 2 });
  });

  test('should ignore prefix with non-defaults', async () => {
    mockyeah = new Mockyeah({
      host: 'my.mockyeah.host',
      portHttps: 7777
    });

    mockyeah.mock('https://example.local', { json: { a: 1 } });

    const response = await mockyeah.fetch('https://my.mockyeah.host:7777/https://example.local');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should work with only wildcard', async () => {
    mockyeah = new Mockyeah();

    mockyeah.mock('*', { json: { a: 1 } });

    const response = await mockyeah.fetch('https://example.local');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should work with regex', async () => {
    mockyeah = new Mockyeah();

    mockyeah.mock(/https:\/\/e.*?e\.local/, { json: { a: 1 } });

    const response = await mockyeah.fetch('https://example.local');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should work with express wildcard in path', async () => {
    mockyeah = new Mockyeah();

    mockyeah.mock('https://example.local/v(.*)/ok', { json: { a: 1 } });

    const response = await mockyeah.fetch('https://example.local/v1/ok');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 1 });

    mockyeah.reset();
  });

  test('should work with post method, query and text', async () => {
    mockyeah = new Mockyeah();

    mockyeah.mock(
      {
        method: 'POST',
        url: 'https://example.local',
        query: {
          ok: /yes/
        },
        body: {
          sure: (v: string): boolean => v === 'thing'
        }
      },
      { text: 'hello' }
    );

    const response = await mockyeah.fetch('https://example.local?ok=yes&and=more', {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ sure: 'thing' })
    });
    const data = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch('text/plain');
    expect(data).toEqual('hello');
  });

  test('should work with dynamic response', async () => {
    mockyeah = new Mockyeah();

    mockyeah.post('https://example.local/v1?', {
      json: req => ({ ok: req.query.ok, hmm: req.body.hmm, method: req.method })
    });

    const response = await mockyeah.fetch('https://example.local/v1?ok=yes', {
      method: 'post',
      body: '{"hmm":"sure"}',
      headers: {
        'content-type': 'application/json'
      }
    });
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ ok: 'yes', hmm: 'sure', method: 'post' });
  });
});
