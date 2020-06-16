import assert from 'assert';
import {
  search,
  get_detail,
  get_chapter,
} from '../server/providers/manhuadui.js';

describe('Provider test: manhuadui', function () {
  this.timeout(5000);
  // this.skip();

  it('test search', () => {
    return search('怪怪守护神', 1).then((result) => {
      assert.equal(result[0].id, 'guaiguaishouhushen');
    });
  });

  it('test get detail', () => {
    return get_detail('guaiguaishouhushen').then((result) => {
      console.log(result);
      assert.equal(result.title, '怪怪守护神');
    });
  });

  it.only('test get chapter', () => {
    return get_chapter('guaiguaishouhushen', '261457').then((result) => {
      assert.equal(result.length, 28);
    });
  });
});
