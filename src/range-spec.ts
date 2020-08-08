export interface RangeSpec<T> {
  isEqual(a: T, b: T): boolean;
  isInfinity(value: T): boolean;
  isGreaterThan(value: T, than: T): boolean;
  isLessThan(value: T, than: T): boolean;
  isGreaterOrEqualTo(value: T, thanTo: T): boolean;
  isLessOrEqualTo(value: T, thanTo: T): boolean;

  comparator: (a: T, b: T) => number;
}

export abstract class AbstractRangeSpec<T> implements RangeSpec<T> {
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
}

export class NumberSpec extends AbstractRangeSpec<number> {
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
