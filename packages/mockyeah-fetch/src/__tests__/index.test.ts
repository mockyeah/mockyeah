import fetch from 'isomorphic-fetch';
import Mockyeah from '../index';

// @ts-ignore
global.fetch = jest.fn();
// @ts-ignore
window.fetch = global.fetch;

const options = {
  noWebSocket: true,
  noProxy: true,
  noPolyfill: true,
  fetch
};

describe('@mockyeah/fetch', () => {
  let mockyeah: Mockyeah;

  afterEach(() => {
    if (mockyeah) mockyeah.reset();
  });

  test('should work with new constructor', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock('https://example.local', { json: { a: 1 } });

    const response = await mockyeah.fetch('https://example.local');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should ignore prefix with defaults', async () => {
    mockyeah = new Mockyeah(options);

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

  test('should work with no response options', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock('*');

    const response = await mockyeah.fetch('https://example.local');
    const data = await response.text();

    expect(response.status).toEqual(200);
    expect(data).toEqual('');
  });

  test('should allow unmocking by id', async () => {
    mockyeah = new Mockyeah(options);

    const { id } = mockyeah.mock('*');

    const response = await mockyeah.fetch('https://example.local');
    const data = await response.text();

    expect(response.status).toEqual(200);
    expect(data).toEqual('');

    mockyeah.unmock(id);

    const response2 = await mockyeah.fetch('https://example.local');

    expect(response2.status).toEqual(404);
  });

  test('should work with only wildcard', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock('*', { json: { a: 1 } });

    const response = await mockyeah.fetch('https://example.local');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should match cookie header', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock(
      {
        cookies: {
          ok: 'yes'
        }
      },
      { text: 'ok' }
    );

    const response = await mockyeah.fetch('https://example.local', {
      headers: {
        Cookie: 'ok=yes'
      }
    });
    const data = await response.text();

    expect(data).toEqual('ok');
  });

  test('should fail to match cookie header', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock(
      {
        cookies: {
          ok: 'yes'
        }
      },
      { text: 'ok' }
    );

    const response = await mockyeah.fetch('https://example.local', {
      headers: {
        Cookie: 'ok=no'
      }
    });

    expect(response.status).toEqual(404);
  });

  test('should work with regex', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock(/https:\/\/e.*?e\.local/, { json: { a: 1 } });

    const response = await mockyeah.fetch('https://example.local');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 1 });
  });

  test('should work with regex not matching', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock(/oops/, { json: { a: 1 } });

    const response = await mockyeah.fetch('https://example.local');

    expect(response.status).toBe(404);
  });

  test('should intercept', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock('https://httpbin.org/html', {
      status: 206,
      text: (req, res) => `${res.body} extravaganza`
    });

    const response = await mockyeah.fetch('https://httpbin.org/html');

    expect(response.status).toBe(206);
    const text = await response.text();
    expect(text).toContain('<html');
    expect(text).toContain('extravaganza');
  });

  test('should intercept based on response option function length alone', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock('https://httpbin.org/html', {
      status: 206,
      text: (req, res) => `${res.body} extravaganza`
    });

    const response = await mockyeah.fetch('https://httpbin.org/html');

    expect(response.status).toBe(206);
    const text = await response.text();
    expect(text).toContain('<html');
    expect(text).toContain('extravaganza');
  });

  test('should intercept async', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock('https://httpbin.org/html', {
      status: 206,
      text: (req, res) => `${res.body} extravaganza`
    });

    const response = await mockyeah.fetch('https://httpbin.org/html');

    expect(response.status).toBe(206);
    const text = await response.text();
    expect(text).toContain('<html');
    expect(text).toContain('extravaganza');
  });

  test('should intercept json', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock('https://httpbin.org/json', {
      json: (req, res) => ({ ...res?.body, also: true })
    });

    const response = await mockyeah.fetch('https://httpbin.org/json');

    const data = await response.json();
    expect(data).toMatchObject({
      slideshow: {
        title: 'Sample Slide Show'
      },
      also: true
    });
  });

  test('should work with express wildcard in path', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.mock('https://example.local/v(.*)/ok', { json: { a: 1 } });

    const response = await mockyeah.fetch('https://example.local/v1/ok');
    const data = await response.json();

    expect(response.headers.get('content-type')).toMatch('application/json');
    expect(data).toEqual({ a: 1 });

    mockyeah.reset();
  });

  test('should work with post method, query and text', async () => {
    mockyeah = new Mockyeah(options);

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
    mockyeah = new Mockyeah(options);

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

  test('should work with dynamic response checking request cookies', async () => {
    mockyeah = new Mockyeah(options);

    mockyeah.post('https://example.local/v1?', {
      json: req => ({ cookieA: req.cookies.a, cookieB: req.cookies.b })
    });

    const response = await mockyeah.fetch('https://example.local/v1?ok=yes', {
      method: 'post',
      body: '{"hmm":"sure"}',
      headers: {
        Cookie: 'a=1; b=2'
      }
    });
    const data = await response.json();

    expect(data).toEqual({ cookieA: '1', cookieB: '2' });
  });
});
