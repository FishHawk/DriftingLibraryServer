import { validateFilename } from '../util/validate';

class Validator<T> {
  protected value: T;

  constructor(value: T) {
    this.value = value;
  }

  to(): T {
    return this.value;
  }

  custom(validateFunction: (value: T) => boolean) {
    if (validateFunction(this.value)) return this;
    return undefined;
  }
}

class ValidatorAny extends Validator<any> {
  setDefault(defaultValue: any) {
    this.value = typeof this.value === 'undefined' ? defaultValue : this.value;
    return this;
  }

  isString() {
    if (typeof this.value === 'string') return new ValidatorString(this.value);
    return undefined;
  }

  isNumber() {
    if (typeof this.value === 'number') return new ValidatorNumber(this.value);
    return undefined;
  }

  isBoolean() {
    if (typeof this.value === 'boolean') return new ValidatorBoolean(this.value);
    return undefined;
  }
}

class ValidatorString extends Validator<string> {
  toInt() {
    const number = Number.parseInt(this.value);
    if (!Number.isNaN(number)) return new ValidatorNumber(number);
    return undefined;
  }

  toFloat() {
    const number = Number.parseFloat(this.value);
    if (!Number.isNaN(number)) return new ValidatorNumber(number);
    return undefined;
  }

  isFilename() {
    if (validateFilename(this.value)) return this;
    return undefined;
  }
  isEmpty() {
    if (this.value.length === 0) return this;
    return undefined;
  }
}

class ValidatorNumber extends Validator<number> {
  limit(min: number, max: number) {
    return this.min(min).max(max);
  }

  min(min: number) {
    if (this.value < min) this.value = min;
    return this;
  }

  max(max: number) {
    if (this.value > max) this.value = max;
    return this;
  }
}

class ValidatorBoolean extends Validator<boolean> {}

export function check(value: any): ValidatorAny {
  return new ValidatorAny(value);
}
