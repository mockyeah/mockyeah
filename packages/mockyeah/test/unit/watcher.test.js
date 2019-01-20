'use strict';

const { expect } = require('chai');

const { restart } = require('../../app/watcher');

const mockApp = playingNames => {
  const _called = {
    play: []
  };

  return {
    config: {
      capturesDir: './captures',
      fixturesDir: './fixtures'
    },
    locals: {
      playingSuites: playingNames ? [...playingNames] : [],
      playingAll: playingNames ? false : true
    },
    reset: () => {
      _called.reset = true;
    },
    play: name => {
      _called.play.push(name);
    },
    playAll: () => {
      _called.playAll = true;
    },
    _called
  };
};

describe('app watcher', () => {
  it('to call reset and play all without existing suites', () => {
    const app = mockApp();
    restart(app);
    expect(app._called).to.deep.equal({
      reset: true,
      playAll: true,
      play: []
    });
  });

  it('to call reset and play existing suites', () => {
    const app = mockApp(['foo', 'bar']);
    restart(app);
    expect(app._called).to.deep.equal({
      reset: true,
      play: ['foo', 'bar']
    });
  });
});
