export type Comparator<T> = (a: T, b: T) => number;
export interface RangeSetTree<T> {
  size: number;
  insert(item: T): void;
  remove(item: T): void;
  clear(): void;
  lowerBound(item: T): TreeIterator<T>;
  upperBound(item: T): TreeIterator<T>;
  iterator(): TreeIterator<T>;
}
export interface TreeIterator<T> {
  prev(): T | null;
  data: T;
}
