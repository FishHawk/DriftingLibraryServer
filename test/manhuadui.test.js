import assert from 'assert';
import { search } from '../server/providers/manhuadui.js';

describe('Provider test: manhuadui', function () {
  this.timeout(5000);
  // this.skip();

  it('should return 2', () => {
    return search('怪怪守护神', 1).then((result) => {
      assert.equal(result[0].title, '怪怪守护神');
    });
  });
});
