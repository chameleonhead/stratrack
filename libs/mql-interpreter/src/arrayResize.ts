export function ArrayResize<T>(arr: T[], newSize: number, defaultValue?: T): T[] {
  if (newSize < 0) throw new Error('newSize must be >= 0');
  if (arr.length > newSize) {
    arr.length = newSize;
  } else {
    while (arr.length < newSize) arr.push(defaultValue as T);
  }
  return arr;
}
