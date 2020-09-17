import { assert } from 'chai';
import { pool } from '../../../src/util/async/async_pool';

describe('Util test: async pool', function () {
  it('should run all promises in parallel when the pool is large enough', async () => {
    const indexList: number[] = [];
    const valueList: number[] = [];

    function timeout(i: number): Promise<number> {
      return new Promise((resolve) => setTimeout(() => resolve(i), i));
    }

    for await (const x of pool(2, [10, 50, 30, 20], timeout)) {
      if (x.isValue) {
        valueList.push(x.value);
        indexList.push(x.index);
      }
    }

    assert.deepEqual(indexList, [0, 2, 1, 3]);
    assert.deepEqual(valueList, [10, 30, 50, 20]);
  });

  it('should limit running promises when the pool is not large enough', async () => {
    const indexList: number[] = [];
    const valueList: number[] = [];

    function timeout(i: number): Promise<number> {
      return new Promise((resolve) => setTimeout(() => resolve(i), i));
    }

    for await (const x of pool(4, [10, 50, 30, 20], timeout)) {
      if (x.isValue) {
        valueList.push(x.value);
        indexList.push(x.index);
      }
    }

    assert.deepEqual(indexList, [0, 3, 2, 1]);
    assert.deepEqual(valueList, [10, 20, 30, 50]);
  });

  it('should return error when reject', async function () {
    const indexList: number[] = [];
    const errorList: number[] = [];

    function timeout(i: number): Promise<number> {
      return new Promise((_resolve, reject) => setTimeout(() => reject(i), i));
    }

    for await (const x of pool(4, [10, 50, 30, 20], timeout)) {
      if (x.isValue == false) {
        errorList.push(x.error as number);
        indexList.push(x.index);
      }
    }

    assert.deepEqual(indexList, [0, 3, 2, 1]);
    assert.deepEqual(errorList, [10, 20, 30, 50]);
  });
});
