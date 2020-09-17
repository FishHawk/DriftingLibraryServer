import { assert } from 'chai';
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
} from '../../../src/util/validator/sanitizer';

describe('Util test: sanitizer', function () {
  describe('#isUndefined', function () {
    const sanitizer = isUndefined();
    it('should return true when value is undefined', () => {
      assert.isTrue(sanitizer(undefined));
    });
    it('should return false when value is not undefined', () => {
      assert.isFalse(sanitizer(0));
    });
  });

  describe('#isNull', function () {
    const sanitizer = isNull();
    it('should return true when value is null', () => {
      assert.isTrue(sanitizer(null));
    });
    it('should return false when value is not null', () => {
      assert.isFalse(sanitizer(undefined));
    });
  });

  describe('#isString', function () {
    const sanitizer = isString();
    it('should return true when value is string', () => {
      assert.isTrue(sanitizer('0'));
    });
    it('should return false when value is not string', () => {
      assert.isFalse(sanitizer(0));
    });
  });

  describe('#isNumber', function () {
    const sanitizer = isNumber();
    it('should return true when value is number', () => {
      assert.isTrue(sanitizer(0));
    });
    it('should return false when value is not number', () => {
      assert.isFalse(sanitizer('0'));
    });
  });

  describe('#isBoolean', function () {
    const sanitizer = isBoolean();
    it('should return true when value is boolean', () => {
      assert.isTrue(sanitizer(true));
      assert.isTrue(sanitizer(false));
    });
    it('should return false when value is not boolean', () => {
      assert.isFalse(sanitizer(0));
      assert.isFalse(sanitizer('true'));
    });
  });

  describe('#isArray', function () {
    const sanitizerSA = isArray(isString());
    const sanitizerNA = isArray(isNumber());

    const stringArray = ['1', '2', '3'];
    const numberArray = [1, 2, 3];
    const mixedArray = [1, '2', 3];

    it('should return true when value is typed array', () => {
      assert.isTrue(sanitizerSA(stringArray));
      assert.isTrue(sanitizerNA(numberArray));
    });
    it('should return false when value is not typed array', () => {
      assert.isFalse(sanitizerSA(numberArray));
      assert.isFalse(sanitizerNA(stringArray));
      assert.isFalse(sanitizerNA(mixedArray));
    });
  });

  describe('#isObject', function () {
    const sanitizerA = isObject({ s: isString() });
    const sanitizerB = isObject({ a: sanitizerA });

    it('should return true when value is typed object', () => {
      const objA = { s: 'string' };
      const objB = { a: objA };
      assert.isTrue(sanitizerA(objA));
      assert.isTrue(sanitizerB(objB));
    });
    it('should return true when value has more property', () => {
      const objA: unknown = { s: 'string', n: 0 };
      assert.isTrue(sanitizerA(objA));
    });
    it('should return false when value has less property', () => {
      const objA: unknown = {};
      assert.isFalse(sanitizerA(objA));
    });
    it('should return false when value has wrong typed property', () => {
      const objA: unknown = { s: 0 };
      assert.isFalse(sanitizerA(objA));
    });
    it('should return false when value has more property and enable strict mode', () => {
      const sanitizerA = isObject({ s: isString() }, true);
      const objA: unknown = { s: 'string', n: 0 };
      assert.isFalse(sanitizerA(objA));
    });
  });

  describe('#union', function () {
    const sanitizer = union([isString(), isNumber()]);

    it('should return true when value is one of union type', () => {
      assert.isTrue(sanitizer(0));
      assert.isTrue(sanitizer('0'));
    });
    it('should return false when value is not one of union type', () => {
      assert.isFalse(sanitizer(true));
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
      assert.isTrue(sanitizer({ s: '0', n: 0 }));
    });
    it('should return false when value is not intersection type', () => {
      assert.isFalse(sanitizer({ s: '0' }));
      assert.isFalse(sanitizer({ n: 0 }));
    });
  });
});
