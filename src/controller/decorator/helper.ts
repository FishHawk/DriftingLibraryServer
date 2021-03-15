import 'reflect-metadata';

export class MetadataEntry<T> {
  constructor(protected readonly key: string) {}

  get(target: Object, defaultValue?: T): T {
    if (!this.has(target)) {
      if (defaultValue !== undefined) return defaultValue;
      else throw Error(`Target does not have metadata ${this.key}.`);
    }
    return Reflect.getMetadata(this.key, target.constructor);
  }

  set(target: Object, value: T) {
    Reflect.defineMetadata(this.key, value, target.constructor);
  }

  has(target: Object): boolean {
    return Reflect.hasMetadata(this.key, target.constructor);
  }
}

export class ListMetadataEntry<T> extends MetadataEntry<T[]> {
  constructor(key: string) {
    super(key);
  }

  push(target: Object, item: T) {
    if (!this.has(target)) this.set(target, []);
    this.get(target).push(item);
  }
}
