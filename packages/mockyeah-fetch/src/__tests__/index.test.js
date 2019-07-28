import '@babel/polyfill';
import 'isomorphic-fetch';
import Mockyeah from '..';

describe('mockyeah-fetch', () => {
  test('should work with url', async () => {
    const mockyeah = Mockyeah();

    mockyeah.mock('https://example.local', { json: { a: 1 } });

    const res = await mockyeah.fetch('https://example.local');
    const data = await res.json();

    expect(res.headers.get('content-type')).toBe('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should work with new constructor', async () => {
    const mockyeah = new Mockyeah();

    mockyeah.mock('https://example.local', { json: { a: 1 } });

    const res = await mockyeah.fetch('https://example.local');
    const data = await res.json();

    expect(res.headers.get('content-type')).toBe('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should work with only wildcard', async () => {
    const mockyeah = Mockyeah();

    mockyeah.mock('*', { json: { a: 1 } });

    const res = await mockyeah.fetch('https://example.local');
    const data = await res.json();

    expect(res.headers.get('content-type')).toBe('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should work with regex', async () => {
    const mockyeah = Mockyeah();

    mockyeah.mock(/https:\/\/e.*?e\.local/, { json: { a: 1 } });

    const res = await mockyeah.fetch('https://example.local');
    const data = await res.json();

    expect(res.headers.get('content-type')).toBe('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should work with express wildcard in path', async () => {
    const mockyeah = Mockyeah();

    mockyeah.mock('https://example.local/v(.*)/ok', { json: { a: 1 } });

    const res = await mockyeah.fetch('https://example.local/v1/ok');
    const data = await res.json();

    expect(res.headers.get('content-type')).toBe('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should work with post method, query and text', async () => {
    const mockyeah = Mockyeah();

    mockyeah.mock(
      {
        method: 'POST',
        url: 'https://example.local',
        query: {
          ok: /yes/
        },
        body: {
          sure: v => v === 'thing'
        }
      },
      { text: 'hello' }
    );

    const res = await mockyeah.fetch('https://example.local?ok=yes&and=more', {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ sure: 'thing' })
    });
    const data = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/plain;\s*charset=UTF-8/);
    expect(data).toEqual('hello');
  });
});
