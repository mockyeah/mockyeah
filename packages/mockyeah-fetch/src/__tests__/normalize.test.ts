import { normalize } from '../normalize';

describe('normalize', () => {
  test('parse query', () => {
    expect(normalize('/v1?ok=yes')).toMatchObject({
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
});
