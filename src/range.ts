import { RangeSpec, NumberSpec } from "./range-spec";

export class Range<T> {
  static open<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    if (!spec.isGreaterOrEqualTo(to, from)) throw Error("Upper bound must be greater than equal to the lower");
    return new Range<T>(spec, from, to, false, false);
  }
  static close<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    if (!spec.isGreaterOrEqualTo(to, from)) throw Error("Upper bound must be greater than equal to the lower");
    return new Range<T>(spec, from, to, !spec.isInfinity(from), !spec.isInfinity(to));
  }
  static openClose<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    if (!spec.isGreaterOrEqualTo(to, from)) throw Error("Upper bound must be greater than equal to the lower");
    return new Range<T>(spec, from, to, false, !spec.isInfinity(to));
  }
  static closeOpen<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    if (!spec.isGreaterOrEqualTo(to, from)) throw Error("Upper bound must be greater than equal to the lower");
    return new Range<T>(spec, from, to, !spec.isInfinity(from), false);
  }
  static singleton<T>(value: T, spec?: RangeSpec<T>): Range<T> {
    return Range.close(value, value, spec);
  }
  static empty<T>(spec?: RangeSpec<T>): Range<T> {
    spec = spec || (new NumberSpec() as any);
    return new Range<T>(spec, spec.unit(), spec.unit(), false, false);
  }

  private constructor(
    public readonly spec: RangeSpec<T>,
    public readonly lower: T,
    public readonly upper: T,
    public readonly isLowerEnclosed: boolean,
    public readonly isUpperEnclosed: boolean
  ) {}

  get isUpperInfinity(): boolean {
    return this.spec.isInfinity(this.upper);
  }
  get isLowerInfinity(): boolean {
    return this.spec.isInfinity(this.lower);
  }
  get isEmpty(): boolean {
    return this.spec.isEqual(this.lower, this.upper) && !this.isLowerEnclosed && !this.isUpperEnclosed;
  }

  intersection(other: Range<T>): Range<T> {
    if (this.isEmpty || other.isEmpty) return Range.empty(this.spec);
    const [from, fromEnclosed] = this.max(
      [this.lower, this.isLowerEnclosed],
      [other.lower, other.isLowerEnclosed],
      true
    );
    const [to, toEnclosed] = this.min([this.upper, this.isUpperEnclosed], [other.upper, other.isUpperEnclosed], false);
    if (this.spec.isGreaterThan(from, to)) return Range.empty(this.spec);
    if (this.spec.isEqual(from, to) && !(fromEnclosed && toEnclosed)) return Range.empty(this.spec);
    return new Range<T>(this.spec, from, to, fromEnclosed, toEnclosed);
  }
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
    const [to, toEnclosed] = this.max([this.upper, this.isUpperEnclosed], [other.upper, other.isUpperEnclosed], false);
    return new Range<T>(this.spec, from, to, fromEnclosed, toEnclosed);
  }
  subtract(other: Range<T>): Range<T>[] {
    if (this.intersection(other).isEmpty) return [this];
    if (this.equals(other)) return [];
    const result: Range<T>[] = [];
    if (this.isLowerBefore(other)) {
      result.push(new Range(this.spec, this.lower, other.lower, this.isLowerEnclosed, !other.isLowerEnclosed));
    }
    if (this.isUpperAfter(other)) {
      result.push(new Range(this.spec, other.upper, this.upper, !other.isUpperEnclosed, this.isUpperEnclosed));
    }
    return result.filter((r) => !r.isEmpty);
  }

  adjacent(other: Range<T>): boolean {
    return this.adjacentRight(other) || this.adjacentLeft(other);
  }
  adjacentRight(other: Range<T>): boolean {
    return other.adjacentLeft(this);
  }
  adjacentLeft(other: Range<T>): boolean {
    if (this.isEmpty || other.isEmpty) return false;
    if (!this.spec.isEqual(this.lower, other.upper)) return false;
    return this.isLowerEnclosed !== other.isUpperEnclosed;
  }
  equals(other: Range<T>): boolean {
    return this.contains(other) && other.contains(this);
  }
  contains(other: Range<T>): boolean;
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

  toString(): string {
    return `${this.isLowerEnclosed ? "[" : "("}${this.lower}; ${this.upper}${this.isUpperEnclosed ? "]" : ")"}`;
  }

  private min([a, aEnclosed]: [T, boolean], [b, bEnclosed]: [T, boolean], lower: boolean): [T, boolean] {
    if (this.spec.isEqual(a, b)) return [a, lower ? aEnclosed || bEnclosed : aEnclosed && bEnclosed];
    if (this.spec.isLessThan(a, b)) {
      return [a, aEnclosed];
    } else {
      return [b, bEnclosed];
    }
  }
  private max([a, aEnclosed]: [T, boolean], [b, bEnclosed]: [T, boolean], lower: boolean): [T, boolean] {
    if (this.spec.isEqual(a, b)) return [a, lower ? aEnclosed && bEnclosed : aEnclosed || bEnclosed];
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
