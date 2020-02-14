import { normalize, stripQuery } from '../normalize';

describe('normalize', () => {
  test('parses query and makes url function', () => {
    const result = normalize('https://ok.com/v1?ok=yes');
    if (typeof result === 'function') throw new Error('should be object');
    expect(result).toMatchObject({
      query: {
        ok: 'yes'
      }
    });
    expect(result.url('https://ok.com/v1')).toBe(true);
  });

  test('parse query', () => {
    expect(normalize('/v1?ok=yes')).toMatchObject({
      query: {
        ok: 'yes'
      }
    });
  });

  test('parse query', () => {
    expect(
      normalize({
        url: '/v1?ok=yes'
      })
    ).toMatchObject({
      query: {
        ok: 'yes'
      }
    });
  });

  test('original normal', () => {
    expect(normalize('/v1?ok=yes')).toMatchObject({
      $meta: {
        originalNormal: {
          url: '/v1',
          query: {
            ok: 'yes'
          }
        }
      }
    });
  });

  test('original normal with query from url in object', () => {
    expect(
      normalize({
        url: '/v1?ok=yes'
      })
    ).toMatchObject({
      $meta: {
        originalNormal: {
          url: '/v1',
          query: {
            ok: 'yes'
          }
        }
      }
    });
  });

  test('original normal with url as top-level regex', () => {
    expect(normalize(/ok/)).toMatchObject({
      $meta: {
        originalNormal: {
          url: /ok/
        }
      }
    });
  });

  test('original normal with url as regex', () => {
    expect(
      normalize({
        url: /ok/
      })
    ).toMatchObject({
      $meta: {
        originalNormal: {
          url: /ok/
        }
      }
    });
  });

  test('original serialized with url as top-level regex', () => {
    expect(normalize(/ok/)).toMatchObject({
      $meta: {
        originalSerialized: {
          url: { $regex: { source: 'ok' } }
        }
      }
    });
  });

  test('original serialized with url as regex', () => {
    expect(
      normalize({
        url: /ok/
      })
    ).toMatchObject({
      $meta: {
        originalSerialized: {
          url: { $regex: { source: 'ok' } }
        }
      }
    });
  });
});

describe('stripQuery', () => {
  test('strips', () => {
    expect(stripQuery('https://ok.com:123/yes?hello=there&sir')).toMatchObject({
      url: 'https://ok.com:123/yes'
    });
  });
});
