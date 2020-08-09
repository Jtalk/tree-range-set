import { RangeSpec, NumberSpec } from "./range-spec";

/**
 * A convenience range/interval type.
 *
 * Built around `number` by default,
 * it supports custom types through the `spec` argument of its constructor methods.
 *
 * Examples:
 * ```typescript
 * // Working with numbers:
 * const instance: Range<number> = Range.openClose(0, 10); // (0; 10]
 * const instance: Range<number> = Range.closeOpen(-10, 10); // [-10; 10)
 * const instance: Range<number> = Range.empty(); // {}, an empty range
 *
 * // Working with a custom type:
 * type MyType;
 * class MyTypeRangeSpec extends AbstractRangeSpec<MyType> {
 *   comparator: (a: MyType, b: MyType): number => a.valueOf() - b.valueOf();
 *   isInfinity: (v: MyType): boolean => false; // You custom type can also be finite
 * }
 * // Creates a ["hello", "world") range.
 * const instance: Range<MyType> = Range.closeOpen(MyType("hello"), MyType("world"),
 *                                                 new MyTypeRangeSpec());
 * ```
 *
 * This class is fully **immutable**.
 *
 * @typeParam T the target type stored by this range.
 *              A custom `spec` is required unless it's coercible to `number`.
 *
 * Extra care is required around handling empty ranges,
 * since they may have their bounds set to `null` if created with [[`Range.empty`]].
 *
 * Note: since it's not possible to make an infinite bound inclusive,
 * relevant constructor methods override the requested bound type for values that
 * conform to [[`RangeSpec.isInfinity`]].
 */
export class Range<T> {
  /**
   * Create an open range, i.e. the one that does not include either of its bounds.
   *
   * ```typescript
   * const instance: Range<number> = Range.open(-1, 1); // (-1; 1)
   * ```
   *
   * It can also be used to implicitly create an empty range:
   * ```typescript
   * const instance: Range<number> = Range.open(10, 10); // {}, an empty range
   * ```
   *
   * @typeParam T the target type to b represented by the resulting range.
   *              A custom `spec` is required unless it's coercible to `number`.
   *
   * @param from A lower bound of the resulting range, excluded.
   * @param to An upper bound of the resulting range, excluded.
   * @param spec Optional. See [[`RangeSpec`]].
   */
  static open<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    if (!spec.isGreaterOrEqualTo(to, from))
      throw Error("Upper bound must be greater than or equal to the lower");
    return new Range<T>(spec, from, to, false, false);
  }

  /**
   * Create a closed range, i.e. the one that includes both its bounds.
   *
   * ```typescript
   * const instance: Range<number> = Range.close(-1, 1); // [-1; 1]
   * ```
   *
   * It can also be used to implicitly create a singleton range:
   * ```typescript
   * Range.close(10, 10).isEqual(Range.singleton(10)); // -> true
   * ```
   *
   * Bounds are forcibly overriden to *open* for infinity bounds, i.e.
   * bound values that conform to [[`RangeSpec.isInfinity`]].
   *
   * @typeParam T the target type to b represented by the resulting range.
   *              A custom `spec` is required unless it's coercible to `number`.
   *
   * @param from A lower bound of the resulting range, included.
   * @param to An upper bound of the resulting range, included.
   * @param spec Optional. See [[`RangeSpec`]].
   */
  static close<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    if (!spec.isGreaterOrEqualTo(to, from))
      throw Error("Upper bound must be greater than or equal to the lower");
    return new Range<T>(spec, from, to, !spec.isInfinity(from), !spec.isInfinity(to));
  }

  /**
   * Create an open-close range, i.e. one that only includes its upper bound.
   *
   * ```typescript
   * const instance: Range<number> = Range.openClose(-1, 1); // (-1; 1]
   * ```
   *
   * It can also be used to implicitly create an empty range:
   * ```typescript
   * const instance: Range<number> = Range.openClose(10, 10); // {}, an empty range
   * ```
   *
   * Bounds are forcibly overriden to *open* for infinity bounds, i.e.
   * bound values that conform to [[`RangeSpec.isInfinity`]].
   *
   * @typeParam T the target type to b represented by the resulting range.
   *              A custom `spec` is required unless it's coercible to `number`.
   *
   * @param from A lower bound of the resulting range, excluded.
   * @param to An upper bound of the resulting range, included.
   * @param spec Optional. See [[`RangeSpec`]].
   */
  static openClose<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    if (!spec.isGreaterOrEqualTo(to, from))
      throw Error("Upper bound must be greater than or equal to the lower");
    return new Range<T>(spec, from, to, false, !spec.isInfinity(to));
  }

  /**
   * Create a close-open range, i.e. the one that only includes its lower bound.
   *
   * ```typescript
   * const instance: Range<number> = Range.closeOpen(-1, 1); // [-1; 1)
   * ```
   *
   * It can also be used to implicitly create an empty range:
   * ```typescript
   * const instance: Range<number> = Range.closeOpen(10, 10); // {}, an empty range
   * ```
   *
   * Bounds are forcibly overriden to *open* for infinity bounds, i.e.
   * bound values that conform to [[`RangeSpec.isInfinity`]].
   *
   * @typeParam T the target type to b represented by the resulting range.
   *              A custom `spec` is required unless it's coercible to `number`.
   *
   * @param from A lower bound of the resulting range, included.
   * @param to An upper bound of the resulting range, excluded.
   * @param spec Optional. See [[`RangeSpec`]].
   */
  static closeOpen<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    if (!spec.isGreaterOrEqualTo(to, from))
      throw Error("Upper bound must be greater than or equal to the lower");
    return new Range<T>(spec, from, to, !spec.isInfinity(from), false);
  }

  /**
   * Create a singleton range, i.e. the one that only includes a single value
   *
   * ```typescript
   * const instance: Range<number> = Range.singleton(5); // [5; 5]
   * ```
   *
   * Note: a singleton instance cannot be created out of a [[`RangeSpec.infinity`]] value,
   * since infinity cannot be enclosed in an interval.
   *
   * @typeParam T the target type to b represented by the resulting range.
   *              A custom `spec` is required unless it's coercible to `number`.
   *
   * @param value The value the resulting range will include.
   * @param spec Optional. See [[`RangeSpec`]].
   * @throws Error if the supplied value conforms to [[`RangeSpec.isInfinity`]].
   */
  static singleton<T>(value: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    if (spec.isInfinity(value)) throw Error(`Cannot create a singleton range out of infinity`);
    return Range.close(value, value, spec);
  }

  /**
   * Create an empty range, i.e. the one that doesn't include anything.
   *
   * ```typescript
   * const instance: Range<number> = Range.empty(); // {}, an empty range
   * ```
   *
   * @typeParam T the target type to b represented by the resulting range.
   *              A custom `spec` is required unless it's coercible to `number`.
   *
   * @param spec Optional. See [[`RangeSpec`]].
   */
  static empty<T>(spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    return new Range<T>(spec, null, null, false, false);
  }

  private constructor(
    /**
     * The spec this range is built upon. Defaults to an instance of [[`NumberSpec`]]
     */
    public readonly spec: RangeSpec<T>,
    /**
     * The lower bound of this range, regardless of whether it's included.
     */
    public readonly lower: T,
    /**
     * The upper bound of this range, regardless of whether it's included.
     */
    public readonly upper: T,
    /**
     * Indicates whether the lower bound is included (i.e. if it's an open bound).
     */
    public readonly isLowerEnclosed: boolean,
    /**
     * Indicates whether the upper bound is included (i.e. if it's an open bound).
     */
    public readonly isUpperEnclosed: boolean
  ) {
    if ((this.lower || this.upper) && this.spec.isLessThan(this.upper, this.lower)) {
      throw Error(
        `Upper bound ${this.upper} must be greater than or equal to the lower bound ${this.lower}`
      );
    }
  }

  /**
   * Tells whether the `spec` this range is built upon returns `isInfinity -> true` for its upper bound.
   */
  get isUpperInfinity(): boolean {
    return this.spec.isInfinity(this.upper);
  }
  /**
   * Tells whether the `spec` this range is built upon returns `isInfinity -> true` for its lower bound.
   */
  get isLowerInfinity(): boolean {
    return this.spec.isInfinity(this.lower);
  }
  /**
   * Tells whether this is an empty range, i.e. the one including no elements.
   */
  get isEmpty(): boolean {
    if (this.lower === null && this.upper === null) return true; // Range.empty case
    return (
      this.spec.isEqual(this.lower, this.upper) && (!this.isLowerEnclosed || !this.isUpperEnclosed)
    );
  }

  /**
   * Returns an intersection of this range with `other`.
   *
   * The result of range intersection shall include the narrowest range that includes
   * all the elements present in both of the source ranges.
   *
   * ```typescript
   * Range.open(10, 20).intersection(Range.closeOpen(12, 16)); // -> [12; 16)
   * Range.open(10, 20).intersection(Range.empty()); // -> {}, an empty range
   * Range.empty().intersection(Range.close(10, 20)); // -> {}, an empty range
   * ```
   *
   * @param other The right-hand side argument of the intersection.
   */
  intersection(other: Range<T>): Range<T> {
    if (this.isEmpty || other.isEmpty) return Range.empty(this.spec);
    const [from, fromEnclosed] = this.max(
      [this.lower, this.isLowerEnclosed],
      [other.lower, other.isLowerEnclosed],
      true
    );
    const [to, toEnclosed] = this.min(
      [this.upper, this.isUpperEnclosed],
      [other.upper, other.isUpperEnclosed],
      false
    );
    if (this.spec.isGreaterThan(from, to)) return Range.empty(this.spec);
    if (this.spec.isEqual(from, to) && !(fromEnclosed && toEnclosed)) return Range.empty(this.spec);
    return new Range<T>(this.spec, from, to, fromEnclosed, toEnclosed);
  }

  /**
   * Returns a union of this range with `other`.
   *
   * The united range is the narrowest range that includes all the elements
   * from both of the source ranges.
   *
   * Union is impossible for non-intersecting ranges, so it might be a good idea
   * to check if they are intersecting/adjacent to avoid excptions:
   *
   * ```typescript
   * const r1 = Range.open(10, 20);
   * const r2 = Range.close(30, 40);
   * if (!r1.intersection(r2).isEmpty || r1.isAdjacent(r2)) {
   *   const united = r1.union(r2);
   *   // Do something with this united range
   * }
   * ```
   *
   * Examples:
   *
   * ```typescript
   * Range.open(10, 20).union(Range.closeOpen(15, 25)); // -> (10; 25)
   * Range.open(10, 20).union(Range.empty()); // -> (10; 20)
   * Range.empty().union(Range.close(10, 20)); // -> (10; 20)
   * Range.open(10, 20).union(Range.singleton(50)); // -> Error("Cannot union non-intersecting and non-adjacent ranges")
   * ```
   *
   * @param other The right-hand side argument of the intersection.
   *
   * @throws if the provided ranges cannot be combined into a contiguous range: they neither intersect nor are adjacent.
   */
  union(other: Range<T>): Range<T> {
    if (this.isEmpty) return other;
    if (other.isEmpty) return this;
    if (this.intersection(other).isEmpty && !this.adjacent(other)) {
      throw Error(`Cannot union non-intersecting and non-adjacent ranges: ${this}, ${other}`);
    }
    const [from, fromEnclosed] = this.min(
      [this.lower, this.isLowerEnclosed],
      [other.lower, other.isLowerEnclosed],
      true
    );
    const [to, toEnclosed] = this.max(
      [this.upper, this.isUpperEnclosed],
      [other.upper, other.isUpperEnclosed],
      false
    );
    return new Range<T>(this.spec, from, to, fromEnclosed, toEnclosed);
  }

  /**
   * Returns parts of this range, excluding all the elements present in the `other` one.
   *
   * ```typescript
   * Range.open(10, 20).subtract(Range.closeOpen(12, 16)); // -> [ (10; 12), [16; 20) ]
   * Range.open(10, 20).subtract(Range.empty()); // (10; 20)
   * Range.empty().subtract(Range.close(10, 20)); // -> [], an empty array
   * ```
   *
   * @param other The range to subtract from `this`.
   * @returns A list of ranges containing all the elements present in `this`, but not in `other`. The list does not
   *          include any empty ranges. The resulting list will be empty if `other` contains `this`.
   */
  subtract(other: Range<T>): Range<T>[] {
    if (this.intersection(other).isEmpty) return [this];
    if (this.equals(other)) return [];
    const result: Range<T>[] = [];
    if (this.isLowerBefore(other)) {
      result.push(
        new Range(this.spec, this.lower, other.lower, this.isLowerEnclosed, !other.isLowerEnclosed)
      );
    }
    if (this.isUpperAfter(other)) {
      result.push(
        new Range(this.spec, other.upper, this.upper, !other.isUpperEnclosed, this.isUpperEnclosed)
      );
    }
    return result.filter((r) => !r.isEmpty);
  }

  /**
   * Tests whether this range is adjacent on either side with the `other`.
   *
   * See [[`Range.adjacentLeft`]] and [[`Range.adjacentRight`]].
   *
   * @param other The range to check `this` against.
   */
  adjacent(other: Range<T>): boolean {
    return this.adjacentRight(other) || this.adjacentLeft(other);
  }

  /**
   * Tests whether `other` is adjacent to `this` on the right, i.e. `other.lower` is connected
   * to `this.upper`, but does not intersect with it.
   *
   * ```typescript
   * Range.open(10, 20).adjacentLeft(Range.close(20, 30)); // -> true
   * Range.open(10, 20).adjacentLeft(Range.empty()); // -> false
   * Range.open(10, 20).adjacentLeft(Range.singleton(20)); // -> true
   * ```
   *
   * @param other The range that is expected to be connected to `this` on the right.
   */
  adjacentRight(other: Range<T>): boolean {
    return other.adjacentLeft(this);
  }

  /**
   * Tests whether `other` is adjacent to `this` on the left, i.e. `other.upper` is connected
   * to `this.lower`, but does not intersect with it.
   *
   * ```typescript
   * Range.open(10, 20).adjacentLeft(Range.close(0, 10)); // -> true
   * Range.open(10, 20).adjacentLeft(Range.empty()); // -> false
   * Range.open(10, 20).adjacentLeft(Range.singleton(10)); // -> true
   * ```
   *
   * @param other The range that is expected to be connected to `this` on the left.
   */
  adjacentLeft(other: Range<T>): boolean {
    if (this.isEmpty || other.isEmpty) return false;
    if (!this.spec.isEqual(this.lower, other.upper)) return false;
    return this.isLowerEnclosed !== other.isUpperEnclosed;
  }

  /**
   * Tests whether `this` has the same bounds & bound inclusion as `other`.
   *
   * Empty ranges are always equal, regardless of what bounds they were built with.
   *
   * ```typescript
   * Range.open(10, 20).equals(Range.open(10, 20)); // -> true
   * Range.empty().equals(Range.open(50, 50)); // -> true
   * Range.singleton(10).equals(Range.empty()); // -> false
   * ```
   *
   * @param other The range expected to be equal to `this`.
   */
  equals(other: Range<T>): boolean {
    return this.contains(other) && other.contains(this);
  }

  /**
   * Tests whether this range contains the entire `other`.
   *
   * Empty ranges are contained in any other range, including another empty range.
   *
   * ```typescript
   * Range.open(10, 20).contains(Range.open(5, 7)); // -> true
   * Range.open(10, 20).contains(Range.open(10, 20)); // -> true
   * Range.close(10, 20).contains(Range.open(10, 20)); // -> true
   * Range.open(10, 20).contains(Range.close(10, 20)); // -> false
   * Range.empty().contains(Range.open(50, 50)); // -> true
   * Range.singleton(10).contains(Range.empty()); // -> true
   * ```
   *
   * @param other The range to test containment against.
   */
  contains(other: Range<T>): boolean;

  /**
   * Tests whether this range contains the `element`.
   *
   * ```typescript
   * Range.open(10, 20).contains(5); // -> true
   * Range.open(10, 20).contains(10); // -> false
   * Range.close(10, 20).contains(10); // -> true
   * Range.empty().contains(0); // -> false
   * Range.singleton(10).contains(10); // -> true
   * ```
   *
   * @param element The element to test containment against.
   */
  contains(element: T): boolean;
  contains(rangeOrElement: Range<T> | T): boolean {
    if (!(rangeOrElement instanceof Range)) {
      rangeOrElement = Range.close(rangeOrElement, rangeOrElement, this.spec);
    }
    if (rangeOrElement.isEmpty) return true;
    const containsLeft =
      this.spec.isGreaterThan(rangeOrElement.lower, this.lower) ||
      (this.spec.isEqual(rangeOrElement.lower, this.lower) &&
        (this.isLowerEnclosed || !rangeOrElement.isLowerEnclosed));
    const containsRight =
      this.spec.isLessThan(rangeOrElement.upper, this.upper) ||
      (this.spec.isEqual(rangeOrElement.upper, this.upper) &&
        (this.isUpperEnclosed || !rangeOrElement.isUpperEnclosed));
    return containsLeft && containsRight;
  }

  /**
   * Returns this range's textual representation.
   *
   * @returns A mathematical representation of this range, relying on `lower` and `upper`'s `toString`.
   *          Returns `{}` for empty range.
   */
  toString(): string {
    if (this.isEmpty) return "{}";
    return `${this.isLowerEnclosed ? "[" : "("}${this.lower}; ${this.upper}${
      this.isUpperEnclosed ? "]" : ")"
    }`;
  }

  private min(
    [a, aEnclosed]: [T, boolean],
    [b, bEnclosed]: [T, boolean],
    lower: boolean
  ): [T, boolean] {
    if (this.spec.isEqual(a, b))
      return [a, lower ? aEnclosed || bEnclosed : aEnclosed && bEnclosed];
    if (this.spec.isLessThan(a, b)) {
      return [a, aEnclosed];
    } else {
      return [b, bEnclosed];
    }
  }
  private max(
    [a, aEnclosed]: [T, boolean],
    [b, bEnclosed]: [T, boolean],
    lower: boolean
  ): [T, boolean] {
    if (this.spec.isEqual(a, b))
      return [a, lower ? aEnclosed && bEnclosed : aEnclosed || bEnclosed];
    if (this.spec.isGreaterThan(a, b)) {
      return [a, aEnclosed];
    } else {
      return [b, bEnclosed];
    }
  }

  private isLowerAfter(than: Range<T>): boolean {
    return (
      this.spec.isGreaterThan(this.lower, than.lower) ||
      (this.spec.isEqual(this.lower, than.lower) && !this.isLowerEnclosed && than.isLowerEnclosed)
    );
  }
  private isLowerBefore(than: Range<T>): boolean {
    return (
      this.spec.isLessThan(this.lower, than.lower) ||
      (this.spec.isEqual(this.lower, than.lower) && this.isLowerEnclosed && !than.isLowerEnclosed)
    );
  }
  private isLowerEqual(to: Range<T>): boolean {
    return this.spec.isEqual(this.lower, to.lower) && this.isLowerEnclosed === to.isLowerEnclosed;
  }
  private isUpperAfter(than: Range<T>): boolean {
    return (
      this.spec.isGreaterThan(this.upper, than.upper) ||
      (this.spec.isEqual(this.upper, than.upper) && this.isUpperEnclosed && !than.isUpperEnclosed)
    );
  }
  private isUpperBefore(than: Range<T>): boolean {
    return (
      this.spec.isLessThan(this.upper, than.upper) ||
      (this.spec.isEqual(this.upper, than.upper) && !this.isUpperEnclosed && than.isUpperEnclosed)
    );
  }
  private isUpperEqual(to: Range<T>): boolean {
    return this.spec.isEqual(this.upper, to.upper) && this.isUpperEnclosed === to.isUpperEnclosed;
  }
}
