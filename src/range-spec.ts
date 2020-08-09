/**
 * An interface representing the knowledge required to create ranges
 * of arbitrary type `T`.
 *
 * This interface is required to construct ranges over custom user-provided types. [[`Range`]] uses
 * [[`NumberSpec`]] by default, so there's no need to specify this spec for number-compatible types,
 * e.g. ones that have `valueOf(): number` implemented.
 *
 * See [[`Range`]] and [[`RangeSet`]] constructor methods for examples of how this spec is used.
 *
 * It is recommended to extend [[`AbstractRangeSpec`]] for user-defined ranges.
 *
 * @typeParam T The type the target range contains.
 */
export interface RangeSpec<T> {
  isEqual(a: T, b: T): boolean;

  /**
   * Should return true for both positive and negative infinity.
   *
   * It is possible to have less than two infinities, i.e. it's theoretically possible (albeit not totally practical)
   * to build a range over a field of 0..Infinity, or -Infinity..0.
   */
  isInfinity(value: T): boolean;
  isGreaterThan(value: T, than: T): boolean;
  isLessThan(value: T, than: T): boolean;
  isGreaterOrEqualTo(value: T, thanTo: T): boolean;
  isLessOrEqualTo(value: T, thanTo: T): boolean;

  /**
   * A standard comparator.
   *
   * It's expected to return 0 upon equality, a negative number if a < b, and a positive if a > b.
   *
   * Care needs to be taken around handling infinity cases, since arithmetic operations on `Infinity`
   * always return `NaN`, thus potentially breaking this interface. It is thus recommended to handle
   * equality cases separately by returning an explicit `0`.
   */
  comparator: (a: T, b: T) => number;
}

/**
 * A convenience wrapper around [[`RangeSpec`]].
 *
 * It allows most of the `RangeSpec` methods to be derived from a single `comparator`.
 */
export abstract class AbstractRangeSpec<T> implements RangeSpec<T> {
  /**
   * A standard comparator implementation.
   *
   * See [[`RangeSpec.comparator`]] for important details.
   */
  abstract get comparator(): (a: T, b: T) => number;

  /**
   * Checks whether the provided value is an `infinity`.
   *
   * See [[`RangeSpec.isInfinity`]] for details.
   */
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

/**
 * A convenience spec for JS `number`.
 *
 * [[`Range`]] constructors use it by default when no explicit spec was provided.
 */
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
