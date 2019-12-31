import { normalize } from '../normalize';

describe('normalize', () => {
  test('parse query', () => {
    expect(normalize('/v1?ok=yes')).toMatchObject({
      query: {
        ok: 'yes'
      }
    });
  });
});
g;
