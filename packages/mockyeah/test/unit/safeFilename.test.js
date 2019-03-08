'use strict';

const { expect } = require('chai');

const safeFilename = require('../../lib/safeFilename');

describe('safeFilename', () => {
  it('strips relative paths', () => {
    const filename = '../../foo';
    expect(safeFilename(filename)).to.equal('foo');
  });

  it('strips relative paths with forward slash', () => {
    const filename = '..\\..\\foo';
    expect(safeFilename(filename)).to.equal('foo');
  });

  it('strips absolute paths', () => {
    const filename = '/tmp/foo';
    expect(safeFilename(filename)).to.equal('tmp/foo');
  });

  it('strips absolute paths with forward slash', () => {
    const filename = '\\tmp\\foo';
    expect(safeFilename(filename)).to.equal('tmp\\foo');
  });

  it('strips double absolute paths with forward slash', () => {
    const filename = '\\\\tmp\\foo';
    expect(safeFilename(filename)).to.equal('tmp\\foo');
  });

  it('strips absolute paths with drive and forward slash', () => {
    const filename = 'C:\\tmp\\foo';
    expect(safeFilename(filename)).to.equal('tmp\\foo');
  });
});
