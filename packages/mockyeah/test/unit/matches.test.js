'use strict';

const { expect } = require('chai');

const matches = require('../../app/lib/matches');

describe('matches', () => {
  it('reports all deep errors by default', () => {
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

    expect(match.errors).to.have.length(2);
  });

  it('short circuits if specified', () => {
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

    expect(match.errors).to.have.length(1);
  });
});
