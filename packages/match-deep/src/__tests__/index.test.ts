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

  test('matches regex', () => {
    const match = matches(
      {
        a: 'cool in the city'
      },
      {
        a: /in.*he/
      }
    );

    expect(match.result).toBe(true);
  });

  test('does not match regex', () => {
    const match = matches(
      {
        a: 'cool in the city'
      },
      {
        a: /a.*b/
      }
    );

    expect(match.result).toBe(false);
  });

  test('matches serialized regex as source', () => {
    const match = matches(
      {
        a: 'cool in the city'
      },
      {
        a: { $regex: 'in\\s.*[it]{2}y$' }
      },
      {
        serializedRegex: true
      }
    );

    expect(match.result).toBe(true);
  });

  test('does not match serialized regex as source', () => {
    const match = matches(
      {
        a: 'cool in the city'
      },
      {
        a: { $regex: 'a.*b' }
      },
      {
        serializedRegex: true
      }
    );

    expect(match.result).toBe(false);
  });

  test('matches serialized regex with source', () => {
    const match = matches(
      {
        a: 'cool in the city'
      },
      {
        a: { $regex: { source: 'in\\s.*[it]{2}y$' } }
      },
      {
        serializedRegex: true
      }
    );

    expect(match.result).toBe(true);
  });

  test('does not match serialized regex with source', () => {
    const match = matches(
      {
        a: 'cool in the city'
      },
      {
        a: { $regex: { source: 'a.*b' } }
      },
      {
        serializedRegex: true
      }
    );

    expect(match.result).toBe(false);
  });

  test('matches serialized regex with source and flags', () => {
    const match = matches(
      {
        a: 'cool in the city'
      },
      {
        a: { $regex: { source: 'IN\\s.*[IT]{2}y$', flags: 'i' } }
      },
      {
        serializedRegex: true
      }
    );

    expect(match.result).toBe(true);
  });

  test('does not match serialized regex with source and flags', () => {
    const match = matches(
      {
        a: 'cool in the city'
      },
      {
        a: { $regex: { source: 'a.*b', flags: 'i' } }
      },
      {
        serializedRegex: true
      }
    );

    expect(match.result).toBe(false);
  });
});
