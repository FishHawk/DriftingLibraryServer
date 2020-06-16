import assert from 'assert';
import {
  search,
  get_detail,
  get_chapter,
} from '../server/providers/manhuadui.js';

describe('Provider test: manhuadui', function () {
  before(function () {
    this.skip();
    this.timeout(5000);
  });

  it('test search', () => {
    return search('怪怪守护神', 1).then((result) => {
      assert.equal(result[0].id, 'guaiguaishouhushen');
    });
  });

  it('test get detail', () => {
    return get_detail('guaiguaishouhushen').then((result) => {
      assert.equal(result.title, '怪怪守护神');
    });
  });

  it('test get chapter', () => {
    return get_chapter('guaiguaishouhushen', '261457').then((result) => {
      assert.equal(result.length, 28);
    });
  });
});
