import assert from 'assert';

import provider from '../server/download/providers/manhuadui.js';

describe('Provider test: manhuadui', function () {
  before(function () {
    this.skip();
    this.timeout(5000);
  });

  it('test search', () => {
    return provider.search('怪怪守护神', 1).then((result) => {
      assert.equal(result[0].id, 'guaiguaishouhushen');
    });
  });

  it('test get detail', () => {
    return provider.getDetail('guaiguaishouhushen').then((result) => {
      assert.equal(result.title, '怪怪守护神');
    });
  });

  it('test get chapter', () => {
    return provider
      .getChapter('guaiguaishouhushen', '261457')
      .then((result) => {
        assert.equal(result.length, 28);
      });
  });
});
