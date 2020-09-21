export async function retry<T>(task: () => Promise<T>, retries: number): Promise<T> {
  return new Promise((resolve, rejects) => {
    function attampt() {
      task().then(resolve).catch(onError);
    }
    function onError(e: any) {
      retries--;
      if (retries == 0) rejects(e);
      else attampt();
    }
    attampt();
  });
}
