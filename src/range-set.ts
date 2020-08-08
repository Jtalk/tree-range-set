import { Range } from "./range";
import { RangeSetTree, Comparator } from "./range-set-tree";
import { RangeSpec, NumberSpec } from "./range-spec";
import * as BinTreeAdapter from "./range-set-tree-bintree";

export class RangeSet<T> {
  private constructor(
    private readonly tree: RangeSetTree<Range<T>>,
    private readonly spec: RangeSpec<T>
  ) {}

  static numeric(
    treeType?: new (comp: Comparator<Range<number>>) => RangeSetTree<Range<number>>
  ): RangeSet<number> {
    return RangeSet.of(new NumberSpec(), treeType);
  }
  static of<T>(
    spec: RangeSpec<T>,
    treeType?: new (comp: Comparator<Range<T>>) => RangeSetTree<Range<T>>
  ): RangeSet<T> {
    const comp = (a: Range<T>, b: Range<T>) => {
      const upperComp = spec.comparator(a.upper, b.upper);
      if (upperComp !== 0) return upperComp;
      if (!a.isUpperEnclosed && b.isUpperEnclosed) return -1;
      if (a.isUpperEnclosed && !b.isUpperEnclosed) return 1;
      return 0;
    };
    if (!treeType) {
      const defaultAdapter: typeof BinTreeAdapter = require("./range-set-tree-bintree");
      treeType = defaultAdapter.BintreeRBRangeSetTree;
      if (!treeType) {
        throw Error(
          `No compatible binary tree implementation was provided for this RangeSet: ` +
            `you should either install "bintree", ` +
            `or provide a compatible binary tree adapter by implementing RangeSetTree and supplying its constructor to this of() invocation`
        );
      }
    }
    return new RangeSet<T>(new treeType(comp), spec);
  }

  add(other: RangeSet<T>): this;
  add(other: Range<T>): this;
  add(other: RangeSet<T> | Range<T>): this {
    if (other instanceof RangeSet) {
      other.subranges.forEach((r) => this.add(r));
      return this;
    }
    if (other.isEmpty) return this;
    if (this.isEmpty) {
      this.tree.insert(other);
      return this;
    }
    const foundIt = this.tree.upperBound(other);
    if (!foundIt.data) {
      foundIt.prev();
    }
    let newRange = other;
    const toDelete: Range<T>[] = [];
    for (
      let item = foundIt.data;
      item !== null && this.spec.isGreaterOrEqualTo(item.upper, newRange.lower);
      item = foundIt.prev()
    ) {
      if (!newRange.intersection(item).isEmpty || newRange.adjacent(item)) {
        toDelete.push(item);
        newRange = newRange.union(item);
      }
    }
    toDelete.forEach((r) => this.tree.remove(r));
    this.tree.insert(newRange);
    return this;
  }

  subtract(other: RangeSet<T>): this;
  subtract(other: Range<T>): this;
  subtract(other: RangeSet<T> | Range<T>): this {
    if (other instanceof RangeSet) {
      other.subranges.forEach((r) => this.subtract(r));
      return this;
    }
    if (this.isEmpty) {
      return this;
    }
    const foundIt = this.tree.upperBound(other);
    if (!foundIt.data) {
      foundIt.prev();
    }
    const toAdd: Range<T>[] = [];
    const toDelete: Range<T>[] = [];
    for (
      let item = foundIt.data;
      item !== null && this.spec.isGreaterOrEqualTo(item.upper, other.lower);
      item = foundIt.prev()
    ) {
      if (other.intersection(item).isEmpty) continue;
      toDelete.push(item);
      item.subtract(other).forEach((r) => toAdd.push(r));
    }
    toDelete.forEach((r) => this.tree.remove(r));
    toAdd.forEach((r) => this.tree.insert(r));
    return this;
  }

  contains(value: T): boolean;
  contains(range: Range<T>): boolean;
  contains(rangeOrValue: Range<T> | T): boolean {
    if (rangeOrValue instanceof Range) {
      return rangeOrValue.isEmpty || !!this.enclosing(rangeOrValue);
    } else {
      return !!this.containing(rangeOrValue);
    }
  }

  containing(value: T): Range<T> | undefined {
    const singleton = Range.singleton(value, this.spec);
    return this.enclosing(singleton);
  }
  enclosing(range: Range<T>): Range<T> | undefined {
    if (range.isEmpty) return; // No range encloses an empty range
    const foundIt = this.tree.lowerBound(range);
    const candidateRange = foundIt.data;
    if (!candidateRange || !candidateRange.contains(range)) return;
    return candidateRange;
  }

  clear(): this {
    this.tree.clear();
    return this;
  }

  get isEmpty(): boolean {
    return this.tree.size === 0;
  }
  get subranges(): Range<T>[] {
    const result: Range<T>[] = [];
    const it = this.tree.iterator();
    let value: Range<T>;
    while ((value = it.prev()) !== null) {
      result.push(value);
    }
    return result.reverse();
  }
}
