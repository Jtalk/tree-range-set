export interface RangeSpec<T> {
  unit(): T;
  plus(a: T, b: T): T;
  minus(a: T, b: T): T;
  min(a: T, b: T): T;
  max(a: T, b: T): T;

  isEqual(a: T, b: T): boolean;
  isInfinity(value: T): boolean;
  isGreaterThan(value: T, than: T): boolean;
  isLessThan(value: T, than: T): boolean;
  isGreaterOrEqualTo(value: T, thanTo: T): boolean;
  isLessOrEqualTo(value: T, thanTo: T): boolean;
}

export abstract class AbstractRangeSpec<T> implements RangeSpec<T> {
  abstract unit(): T;
  abstract plus(a: T, b: T): T;
  abstract minus(a: T, b: T): T;

  abstract isEqual(a: T, b: T): boolean;
  abstract isInfinity(value: T): boolean;
  abstract isGreaterThan(value: T, than: T): boolean;

  isGreaterOrEqualTo(value: T, thanTo: T): boolean {
    return this.isEqual(value, thanTo) || this.isGreaterThan(value, thanTo);
  }

  isLessOrEqualTo(value: T, thanTo: T): boolean {
    return this.isEqual(value, thanTo) || this.isLessThan(value, thanTo);
  }

  isLessThan(value: T, than: T): boolean {
    return this.isGreaterThan(than, value);
  }

  max(a: T, b: T): T {
    return this.isGreaterThan(a, b) ? a : b;
  }

  min(a: T, b: T): T {
    return this.isGreaterThan(a, b) ? b : a;
  }
}

export class DefaultRangeSpec<T> extends AbstractRangeSpec<T> implements RangeSpec<T> {
  unit(): T {
    return (1 as any) as T;
  }
  plus(a: T, b: T): T {
    return ((+a + +b) as any) as T;
  }
  minus(a: T, b: T): T {
    return ((+a - +b) as any) as T;
  }
  isEqual(a: T, b: T): boolean {
    return a === b;
  }
  isInfinity(value: T): boolean {
    return +value === Infinity;
  }
  isGreaterThan(value: T, than: T): boolean {
    return value > than;
  }
}

export class NumberSpec extends AbstractRangeSpec<number> {
  unit(): number {
    return 1;
  }
  plus(a: number, b: number): number {
    return a + b;
  }
  minus(a: number, b: number): number {
    return a - b;
  }
  isEqual(a: number, b: number): boolean {
    return a === b;
  }
  isInfinity(value: number): boolean {
    return +value === Infinity;
  }
  isGreaterThan(value: number, than: number): boolean {
    return value > than;
  }
}

export class Range<T> {
  static open<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || new DefaultRangeSpec<T>();
    return new Range<T>(spec, spec.plus(from, spec.unit()), spec.minus(to, spec.unit()), from, to);
  }
  static close<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || new DefaultRangeSpec<T>();
    return new Range<T>(spec, from, to, from, to);
  }
  static openClose<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || new DefaultRangeSpec<T>();
    return new Range<T>(spec, spec.plus(from, spec.unit()), to, from, to);
  }
  static closeOpen<T>(from: T, to: T, spec?: RangeSpec<T>): Range<T> {
    spec = spec || new DefaultRangeSpec<T>();
    return new Range<T>(spec, from, spec.minus(to, spec.unit()), from, to);
  }
  static empty<T>(spec: RangeSpec<T>): Range<T> {
    const base = spec.unit();
    return new Range<T>(spec, spec.plus(base, spec.unit()), spec.minus(base, spec.unit()), base, base);
  }

  private constructor(
    private spec: RangeSpec<T>,
    private readonly _lower: T,
    private readonly _upper: T,
    private readonly originalLower: T,
    private readonly originalUpper: T
  ) {}

  get upper(): T {
    return this.originalUpper;
  }
  get lower(): T {
    return this.originalLower;
  }
  get isUpperEnclosed(): boolean {
    return this.spec.isEqual(this._upper, this.originalUpper);
  }
  get isLowerEnclosed(): boolean {
    return this.spec.isEqual(this._lower, this.originalLower);
  }
  get isUpperInfinity(): boolean {
    return this.spec.isInfinity(this._upper);
  }
  get isLowerInfinity(): boolean {
    return this.spec.isInfinity(this._lower);
  }
  get isSingleton(): boolean {
    return !this.isEmpty && this.spec.isEqual(this._upper, this._lower);
  }
  get isEmpty(): boolean {
    return this.spec.isGreaterThan(this._lower, this._upper);
  }

  intersection(other: Range<T>): Range<T> {
    const [from, originalFrom] = minMax(
      (a, b) => this.spec.max(a, b),
      [this._lower, this.originalLower],
      [other._lower, other.originalLower]
    );
    const [to, originalTo] = minMax(
      (a, b) => this.spec.min(a, b),
      [this._upper, this.originalUpper],
      [other._upper, other.originalUpper]
    );
    return new Range<T>(this.spec, from, to, originalFrom, originalTo);
  }
  union(other: Range<T>): Range<T> {
    if (!this.intersection(other).isEmpty && !this.adjacent(other)) {
      throw Error(`Cannot union non-intersecting and non-adjacent ranges: ${this}, ${other}`);
    }
    const [from, originalFrom] = minMax(
      (a, b) => this.spec.min(a, b),
      [this._lower, this.originalLower],
      [other._lower, other.originalLower]
    );
    const [to, originalTo] = minMax(
      (a, b) => this.spec.max(a, b),
      [this._upper, this.originalUpper],
      [other._upper, other.originalUpper]
    );
    return new Range<T>(this.spec, from, to, originalFrom, originalTo);
  }

  adjacent(other: Range<T>): boolean {
    return this.adjacentRight(other) || this.adjacentLeft(other);
  }
  adjacentRight(other: Range<T>): boolean {
    return other.adjacentLeft(this);
  }
  adjacentLeft(other: Range<T>): boolean {
    return !this.isEmpty && this.spec.isEqual(this._lower, this.spec.plus(other.upper, this.spec.unit()));
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
    return (
      this.spec.isGreaterOrEqualTo(rangeOrElement._lower, this._lower) &&
      this.spec.isLessOrEqualTo(rangeOrElement._upper, this._upper)
    );
  }
}

function minMax<T>(abMinMax: (a: T, b: T) => T, [a, originalA]: [T, T], [b, originalB]: [T, T]): [T, T] {
  const value = abMinMax(a, b);
  if (this.spec.isEqual(value, a)) {
    return [a, originalA];
  } else {
    return [b, originalB];
  }
}
