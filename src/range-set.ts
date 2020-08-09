import { Range } from "./range";
import { RangeSetTree, Comparator } from "./range-set-tree";
import { RangeSpec, NumberSpec } from "./range-spec";
import * as BinTreeAdapter from "./range-set-tree-bintree";

/**
 * A set of non-intersecting ranges.
 *
 * This class provides operators for combining, subtracting, and querying
 * sets of ranges of an arbitrary type `T`. It automatically merges adjacent/intersecting
 * ranges after each operation, guaranteeing the smallest possible number of subranges
 * for every set of underlying ranges it represents.
 *
 * This class is **mutable** for performance reasons.
 *
 * This implementation is backed by a tree implementation conforming to [[`RangeSetTree`]].
 * The default implementation is `bintrees`' [[`BintreeRBRangeSetTree`]].
 *
 * @typeParam T The type of the ranges this set is expected to hold.
 */
export class RangeSet<T> {
  private constructor(
    private readonly tree: RangeSetTree<Range<T>>,
    private readonly spec: RangeSpec<T>
  ) {}

  /**
   * A shorthand constructor for numeric ranges.
   *
   * @param treeType An optional constructor for the underlying tree.
   *        Defaults to [[`BintreeRBRangeSetTree`]].
   *
   * @returns A range set built around JS `number`.
   */
  static numeric(
    treeType?: new (comp: Comparator<Range<number>>) => RangeSetTree<Range<number>>
  ): RangeSet<number> {
    return RangeSet.of(new NumberSpec(), treeType);
  }

  /**
   * A constructor method for a range set of any custom type `T`.
   *
   * @typeParam T the type of the resulting range set.
   * @param spec See [[`RangeSpec`]]
   * @param treeType An optional constructor for the underlying tree.
   *                 Defaults to [[`BintreeRBRangeSetTree`]].
   */
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

  /**
   * Add another range set to this set, merging intersecting/adjacent ranges.
   *
   * This operation modifies `this`, but keeps `other` untouched.
   *
   * @param other The other range set to add values from.
   *              It is **possible** to add a range set built with a different underlying tree implementation.
   */
  add(other: RangeSet<T>): this;

  /**
   * Add a range to this set, merging intersecting/adjacent ranges.
   *
   * This operation modifies `this`.
   *
   * @param other The range to add values from.
   */
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
    if (!newRange.isEmpty) this.tree.insert(newRange);
    return this;
  }

  /**
   * Subtract every range from the provided range set from this set.
   *
   * This operation modifies `this`, but keeps `other` untouched.
   *
   * This operation relies on [[`Range.union`]].
   *
   * @param other The other range set containing the ranges to subtract.
   *              It is **possible** to subtract a range set built with a different underlying tree implementation.
   */
  subtract(other: RangeSet<T>): this;

  /**
   * Subtract `other` from this set.
   *
   * This operation modifies `this`.
   *
   * This operation relies on [[`Range.subtract`]].
   *
   * @param other The range to subtract.
   */
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
    toAdd.filter((r) => !r.isEmpty).forEach((r) => this.tree.insert(r));
    return this;
  }

  /**
   * Checks whether any of the ranges within this set contains `value`.
   *
   * "Infinity" values cannot be contained, and therefore always return `false`.
   * @param value The value to check the containment of.
   */
  contains(value: T): boolean;

  /**
   * Checks whether any of the ranges within this set contains `range`.
   *
   * See [[`Range.contains`]] for details of how this check is performed.
   *
   * An empty range is always contained in any set. An empty set contains no ranges but an empty range.
   *
   * A range with an infinite bound contains other ranges with the same infinite bound, even though
   * infinity itself cannot be contained.
   *
   * @param value The value to check the containment of.
   */
  contains(range: Range<T>): boolean;
  contains(rangeOrValue: Range<T> | T): boolean {
    if (rangeOrValue instanceof Range) {
      return rangeOrValue.isEmpty || !!this.enclosing(rangeOrValue);
    } else {
      return !!this.containing(rangeOrValue);
    }
  }

  /**
   * Finds a range containing the provided value.
   *
   * "Infinity" values cannot be contained, and therefore always return `undefined`.
   *
   * @param value The value to check the containment of.
   * @returns The range that [[`Range.contains`]] `value` if found, or `undefined` otherwise.
   */
  containing(value: T): Range<T> | undefined {
    if (this.spec.isInfinity(value)) return; // It cannot contain infinity
    const singleton = Range.singleton(value, this.spec);
    return this.enclosing(singleton);
  }

  /**
   * Finds a range enclosing the provided range.
   *
   * Enclosing means containing all the elements of `range` within the resulting range.
   *
   * Note: an empty range is **not enclosed** by any other range.
   *
   * @param range The value to be enclosed by the return.
   * @returns The range that [[`Range.contains`]] `range` if found, except an empty range, or `undefined` otherwise.
   */
  enclosing(range: Range<T>): Range<T> | undefined {
    if (range.isEmpty) return; // No range encloses an empty range
    const foundIt = this.tree.lowerBound(range);
    const candidateRange = foundIt.data;
    if (!candidateRange || !candidateRange.contains(range)) return;
    return candidateRange;
  }

  /**
   * Clear the underlying tree, thus resetting `this` to an empty set.
   */
  clear(): this {
    this.tree.clear();
    return this;
  }

  /**
   * Checks whether this set is empty, i.e. whether [[`RangeSet.subranges`]] is an empty array.
   */
  get isEmpty(): boolean {
    return this.tree.size === 0;
  }

  /**
   * Returns the array of the underlying ranges of this set.
   *
   * The resulting ranges are guaranteed not to intersect with each other, nor to be adjacent to any of them.
   */
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
