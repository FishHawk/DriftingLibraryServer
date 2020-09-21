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

export async function* pool<A, T>(
  tasks: (() => Promise<T>)[],
  concurrent: number
): AsyncGenerator<PoolReturn<T>, void> {
  const executing: Promise<any>[] = [];

  for (const [index, task] of tasks.entries()) {
    const promise = task()
      .then((value) => ({ isValue: true, index, value }))
      .catch((error) => ({ isValue: false, index, error }))
      .finally(() => executing.splice(executing.indexOf(promise), 1));
    executing.push(promise);
    if (executing.length >= concurrent) yield await Promise.race(executing);
  }

  while (executing.length > 0) {
    yield await Promise.race(executing);
  }
}
