export async function retry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  return new Promise((resolve, rejects) => {
    function attampt() {
      fn().then(resolve).catch(onError);
    }
    function onError(e: any) {
      retries--;
      if (retries == 0) rejects(e);
      else attampt();
    }
    attampt();
  });
}
