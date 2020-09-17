interface PoolValue<T> {
  isValue: true;
  index: number;
  value: T;
}

interface PoolError {
  isValue: false;
  index: number;
  error: unknown;
}

type PoolReturn<T> = PoolValue<T> | PoolError;

const a: PoolReturn<number> = { isValue: false, index: 1, error: 1 } as PoolReturn<number>
if (!a.isValue)a
else a

export async function* pool<A, T>(
  poolLimit: number,
  values: A[],
  fn: (a: A) => Promise<T>
): AsyncGenerator<PoolReturn<T>, void> {
  const executing: Promise<any>[] = [];

  for (const [index, input] of values.entries()) {
    const promise = fn(input)
      .then((value) => ({ isValue: true, index, value }))
      .catch((error) => ({ isValue: false, index, error }))
      .finally(() => executing.splice(executing.indexOf(promise), 1));
    executing.push(promise);
    if (executing.length >= poolLimit) yield await Promise.race(executing);
  }
  while (executing.length > 0) {
    yield await Promise.race(executing);
  }
}
