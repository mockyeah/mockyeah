import matches from '..';

describe('matches', () => {
  test('reports all deep errors by default', () => {
    const match = matches(
      {
        a: 1,
        b: 2,
        c: {
          d: 3,
          e: 4,
          f: 5
        }
      },
      {
        a: 1,
        c: {
          d: 0,
          e: 4,
          f: 9
        }
      }
    );

    expect(match.errors).toHaveLength(2);
  });

  test('short circuits if specified', () => {
    const match = matches(
      {
        a: 1,
        b: 2
      },
      {
        c: 1,
        d: 2
      },
      {
        shortCircuit: true
      }
    );

    expect(match.errors).toHaveLength(1);
  });
});
