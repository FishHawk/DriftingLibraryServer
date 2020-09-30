import { assert } from 'chai';
import * as fs from '../../../src/util/fs/promise';

describe('Util test: fs promise', function () {
  it('#getExtension', () => {
    assert.equal(fs.getExtension(''), '');
    assert.equal(fs.getExtension('name'), '');
    assert.equal(fs.getExtension('name.txt'), 'txt');
    assert.equal(fs.getExtension('.jpeg'), '');
    assert.equal(fs.getExtension('name.with.many.dots'), 'dots');
  });

  it('#getBasename', () => {
    assert.equal(fs.getBasename(''), '');
    assert.equal(fs.getBasename('name'), 'name');
    assert.equal(fs.getBasename('name.txt'), 'name');
    assert.equal(fs.getBasename('.jpeg'), '.jpeg');
    assert.equal(fs.getBasename('name.with.many.dots'), 'name.with.many');
  });
});
