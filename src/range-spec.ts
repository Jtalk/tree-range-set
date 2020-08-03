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

  comparator: (a: T, b: T) => number;
}

export abstract class AbstractRangeSpec<T> implements RangeSpec<T> {
  abstract unit(): T;
  abstract plus(a: T, b: T): T;
  abstract minus(a: T, b: T): T;

  abstract get comparator(): (a: T, b: T) => number;

  abstract isInfinity(value: T): boolean;

  isEqual(a: T, b: T): boolean {
    return this.comparator(a, b) === 0;
  }
  isGreaterThan(value: T, than: T): boolean {
    return this.comparator(value, than) > 0;
  }
  isGreaterOrEqualTo(value: T, thanTo: T): boolean {
    return this.comparator(value, thanTo) >= 0;
  }
  isLessOrEqualTo(value: T, thanTo: T): boolean {
    return this.comparator(value, thanTo) <= 0;
  }
  isLessThan(value: T, than: T): boolean {
    return this.comparator(value, than) < 0;
  }

  max(a: T, b: T): T {
    return this.isGreaterThan(a, b) ? a : b;
  }

  min(a: T, b: T): T {
    return this.isGreaterThan(a, b) ? b : a;
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
  get comparator(): (a: number, b: number) => number {
    return (a, b) => {
      if (a === b) return 0; // Infinity case should return 0 here
      return a - b;
    };
  }
  isInfinity(value: number): boolean {
    return +value === Infinity || -value === Infinity;
  }
}
