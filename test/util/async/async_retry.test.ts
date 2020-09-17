import { rejects } from 'assert';
import { assert } from 'chai';
import { retry } from '../../../src/util/async/async_retry';

describe('Util test: async retry', function () {
  it('should retry if promise reject', async () => {
    let attempt = 0;
    const timeout = () =>
      new Promise((resolve, rejects) =>
        setTimeout(() => {
          attempt++;
          if (attempt < 3) rejects();
          else resolve(attempt);
        }, 10)
      );
    const result = await retry(timeout, 3);
    assert.equal(attempt, 3);
    assert.equal(result, 3);
  });

  it('should return immediately if resolve', async () => {
    let attempt = 0;
    const timeout = () =>
      new Promise((resolve) =>
        setTimeout(() => {
          attempt++;
          resolve(attempt);
        }, 10)
      );
    const result = await retry(timeout, 3);
    assert.equal(attempt, 1);
    assert.equal(result, 1);
  });
});
