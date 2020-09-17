export async function asyncPool<A, T>(
  poolLimit: number,
  values: A[],
  fn: (a: A) => Promise<T>
): Promise<(T | undefined)[]> {
  const ret: Promise<T | undefined>[] = [];
  const executing: Promise<any>[] = [];

  for (const a of values) {
    const p = fn(a).catch(() => undefined);
    ret.push(p);

    if (poolLimit <= values.length) {
      const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) await Promise.race(executing);
    }
  }
  return Promise.all(ret);
}
