/**
 * These are adapter tree implementations from the `bintrees` package.
 * @packageDocumentation
 */
import { RBTree, Iterator, BinTree } from "bintrees";
import { RangeSetTree, Comparator, TreeIterator } from "./range-set-tree";

/**
 * A red-black underlying tree for [[`RangeSet`]].
 */
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

/**
 * A regular underlying binary search tree for [[`RangeSet`]].
 */
export class BintreeRangeSetTree<T> implements RangeSetTree<T> {
  private readonly tree: BinTree<T>;
  constructor(comparator: Comparator<T>) {
    this.tree = new BinTree<T>(comparator);
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

/**
 * A universal `bintrees` iterator, compatible with both of the adapters.
 */
class BintreeIterator<T> implements TreeIterator<T> {
  constructor(private readonly orig: Iterator<T>) {}
  prev(): T | null {
    return this.orig.prev();
  }
  get data(): T | null {
    return this.orig.data();
  }
}

exports.BintreeRBRangeSetTree = BintreeRBRangeSetTree;
exports.BintreeRangeSetTree = BintreeRangeSetTree;
