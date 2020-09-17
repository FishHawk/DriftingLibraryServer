import { assert } from 'chai';
import { validateFilename } from '../../../src/util/validator/validate';

describe('Util test: validate', function () {
  describe('#validateFilename', function () {
    it('should return true when filename is legal', () => {
      assert.isTrue(validateFilename('pic.png'));
    });
    it('should return false when filename is illegal', () => {
      assert.isFalse(validateFilename('../'));
      assert.isFalse(validateFilename('./'));
      assert.isFalse(validateFilename('.'));
      assert.isFalse(validateFilename('../test'));
    });
  });
});
