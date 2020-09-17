import { assert } from 'chai';
import { pool } from '../../../src/util/async/async_pool';

describe('Util test: async pool', function () {
  it('should run all promises in parallel when the pool is large enough', async () => {
    const results: number[] = [];
    const timeout = (i: number) =>
      new Promise((resolve) =>
        setTimeout(() => {
          results.push(i);
          resolve();
        }, i)
      );
    await pool(2, [100, 500, 300, 200], timeout);
    assert.deepEqual(results, [100, 300, 500, 200]);
  });

  it('should limit running promises when the pool is not big enough', async () => {
    const results: number[] = [];
    const timeout = (i: number) =>
      new Promise((resolve) =>
        setTimeout(() => {
          results.push(i);
          resolve();
        }, i)
      );
    await pool(5, [100, 500, 300, 200], timeout);
    assert.deepEqual(results, [100, 200, 300, 500]);
  });

  it('should return value when resolve', async function () {
    const timeout = (i: number) =>
      new Promise((resolve) =>
        setTimeout(() => {
          resolve(i);
        }, i)
      );
    const results = await pool(2, [100, 500, 300, 200], timeout);
    assert.deepEqual(results, [100, 500, 300, 200]);
  });

  it('should return undefined when reject', async function () {
    const timeout = (i: number) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          if (i == 300) reject();
          else resolve(i);
        }, i)
      );
    const results = await pool(2, [100, 500, 300, 200], timeout);
    assert.deepEqual(results, [100, 500, undefined, 200]);
  });
});
