import { RBTree, Iterator, Callback } from "bintrees";

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

export class BintreeRBRangeSetTree<T> implements RangeSetTree<T> {
  private readonly tree: RBTree<T>;
  constructor(comparator: Comparator<T>) {
    this.tree = new RBTree<T>(comparator);
  }

  get size(): number {
    return this.tree.size;
  }

  insert(item: T): void {
    this.tree.insert(item);
  }
  remove(item: T): void {
    this.tree.remove(item);
  }
  clear(): void {
    this.tree.clear();
  }

  lowerBound(item: T): TreeIterator<T> {
    return new BintreeIterator(this.tree.lowerBound(item));
  }
  upperBound(item: T): TreeIterator<T> {
    return new BintreeIterator(this.tree.upperBound(item));
  }

  iterator(): TreeIterator<T> {
    return new BintreeIterator(this.tree.iterator());
  }
}

class BintreeIterator<T> implements TreeIterator<T> {
  constructor(private readonly orig: Iterator<T>) {}
  prev(): T | null {
    return this.orig.prev();
  }
  get data(): T | null {
    return this.orig.data();
  }
}
