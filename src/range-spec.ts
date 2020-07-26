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
