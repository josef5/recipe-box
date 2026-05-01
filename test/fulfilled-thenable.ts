export function createFulfilledThenable<T>(value: T): Promise<T> {
  const thenable = Promise.resolve(value) as Promise<T> & {
    status?: "fulfilled";
    value?: T;
  };

  thenable.status = "fulfilled";
  thenable.value = value;

  return thenable;
}
