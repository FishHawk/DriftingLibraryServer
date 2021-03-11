import 'reflect-metadata';

export function getIndications<T>(target: Object, key: any): T[] {
  if (!Reflect.hasMetadata(key, target.constructor)) {
    Reflect.defineMetadata(key, [], target.constructor);
  }
  return Reflect.getMetadata(key, target.constructor);
}

export function pushIndication<T>(target: Object, key: any, ind: T) {
  if (!Reflect.hasMetadata(key, target.constructor)) {
    Reflect.defineMetadata(key, [], target.constructor);
  }
  const list: T[] = Reflect.getMetadata(key, target.constructor);
  list.push(ind);
}
