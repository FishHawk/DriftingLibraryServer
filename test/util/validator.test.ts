import assert from 'assert';
import {
  isUndefined,
  isNull,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  union,
  intersection,
} from '../../src/util/sanitizer';

describe('Util test: validator', function () {
  describe('#isUndefined', function () {
    const sanitizer = isUndefined();
    it('should return true when value is undefined', () => {
      assert.equal(sanitizer(undefined), true);
    });
    it('should return false when value is not undefined', () => {
      assert.equal(sanitizer(0), false);
    });
  });

  describe('#isNull', function () {
    const sanitizer = isNull();
    it('should return true when value is null', () => {
      assert.equal(sanitizer(null), true);
    });
    it('should return false when value is not null', () => {
      assert.equal(sanitizer(undefined), false);
    });
  });

  describe('#isString', function () {
    const sanitizer = isString();
    it('should return true when value is string', () => {
      assert.equal(sanitizer('0'), true);
    });
    it('should return false when value is not string', () => {
      assert.equal(sanitizer(0), false);
    });
  });

  describe('#isNumber', function () {
    const sanitizer = isNumber();
    it('should return true when value is number', () => {
      assert.equal(sanitizer(0), true);
    });
    it('should return false when value is not number', () => {
      assert.equal(sanitizer('0'), false);
    });
  });

  describe('#isBoolean', function () {
    const sanitizer = isBoolean();
    it('should return true when value is boolean', () => {
      assert.equal(sanitizer(true), true);
      assert.equal(sanitizer(false), true);
    });
    it('should return false when value is not boolean', () => {
      assert.equal(sanitizer(0), false);
      assert.equal(sanitizer('true'), false);
    });
  });

  describe('#isArray', function () {
    const sanitizerSA = isArray(isString());
    const sanitizerNA = isArray(isNumber());

    const stringArray = ['1', '2', '3'];
    const numberArray = [1, 2, 3];
    const mixedArray = [1, '2', 3];

    it('should return true when value is typed array', () => {
      assert.equal(sanitizerSA(stringArray), true);
      assert.equal(sanitizerNA(numberArray), true);
    });
    it('should return false when value is not typed array', () => {
      assert.equal(sanitizerSA(numberArray), false);
      assert.equal(sanitizerNA(stringArray), false);
      assert.equal(sanitizerNA(mixedArray), false);
    });
  });

  describe('#isObject', function () {
    const sanitizerA = isObject({ s: isString() });
    const sanitizerB = isObject({ a: sanitizerA });

    it('should return true when value is typed object', () => {
      const objA = { s: 'string' };
      const objB = { a: objA };
      assert.equal(sanitizerA(objA), true);
      assert.equal(sanitizerB(objB), true);
    });
    it('should return true when value has more property', () => {
      const objA: unknown = { s: 'string', n: 0 };
      assert.equal(sanitizerA(objA), true);
    });
    it('should return false when value has less property', () => {
      const objA: unknown = {};
      assert.equal(sanitizerA(objA), false);
    });
    it('should return false when value has wrong typed property', () => {
      const objA: unknown = { s: 0 };
      assert.equal(sanitizerA(objA), false);
    });

    it('should return false when value has more property and enable strict mode', () => {
      const sanitizerA = isObject({ s: isString() }, true);
      const objA: unknown = { s: 'string', n: 0 };
      assert.equal(sanitizerA(objA), false);
    });
  });

  describe('#union', function () {
    const sanitizer = union([isString(), isNumber()]);

    it('should return true when value is one of union type', () => {
      assert.equal(sanitizer(0), true);
      assert.equal(sanitizer('0'), true);
    });
    it('should return false when value is not one of union type', () => {
      assert.equal(sanitizer(true), false);
    });
  });

  describe('#intersection', function () {
    interface A {
      s: string;
    }
    interface B {
      n: number;
    }

    const sanitizerA = isObject<A>({ s: isString() });
    const sanitizerB = isObject<B>({ n: isNumber() });
    const sanitizer = intersection([sanitizerA, sanitizerB]);

    it('should return true when value is intersection type', () => {
      assert.equal(sanitizer({ s: '0', n: 0 }), true);
    });
    it('should return false when value is not intersection type', () => {
      assert.equal(sanitizer({ s: '0' }), false);
      assert.equal(sanitizer({ n: 0 }), false);
    });
  });
});
