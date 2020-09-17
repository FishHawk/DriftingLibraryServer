import { validateFilename } from './validate';

export class Validator<T> {
  protected rules: ((v: T) => boolean)[] = [];

  validate(value: T): boolean {
    for (const rule of this.rules) {
      if (!rule(value)) return false;
    }
    return true;
  }

  equal(expected: T) {
    this.rules.push((v) => v === expected);
    return this;
  }

  notEqual(expected: T) {
    this.rules.push((v) => v !== expected);
    return this;
  }
}

export class StringValidator extends Validator<string> {
  isEmpty() {
    this.rules.push((v) => v.length === 0);
    return this;
  }

  isNotEmpty() {
    this.rules.push((v) => v.length > 0);
    return this;
  }

  isFilename() {
    this.rules.push(validateFilename);
    return this;
  }
}

export class NumberValidator extends Validator<number> {
  min(min: number) {
    this.rules.push((v) => v >= min);
    return this;
  }

  max(max: number) {
    this.rules.push((v) => v <= max);
    return this;
  }

  limit(min: number, max: number) {
    return this.min(min).max(max);
  }

  isInteger() {
    this.rules.push((v) => Number.isInteger(v));
    return this;
  }

  isFinite() {
    this.rules.push((v) => Number.isFinite(v));
    return this;
  }
}
