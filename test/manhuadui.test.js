import assert from 'assert';
import { search, get_detail } from '../server/providers/manhuadui.js';

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
});
