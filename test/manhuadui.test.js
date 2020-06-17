import assert from 'assert';

import source from '../server/provider/source/manhuadui.js';

describe('Source test: manhuadui', function () {
  before(function () {
    // this.skip();
    this.timeout(5000);
  });

  it('test search', () => {
    return source.search('怪怪守护神', 1).then((result) => {
      assert.equal(result[0].id, 'guaiguaishouhushen');
    });
  });

  it('test get detail', () => {
    return source.getDetail('guaiguaishouhushen').then((result) => {
      assert.equal(result.title, '怪怪守护神');
    });
  });

  it('test get chapter', () => {
    return source.getChapter('guaiguaishouhushen', '261457').then((result) => {
      assert.equal(result.length, 28);
    });
  });
});
