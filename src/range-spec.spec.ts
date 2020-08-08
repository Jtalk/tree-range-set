import { NumberSpec } from "./range-spec";

describe("RangeSpec", () => {
  describe("NumberSpec", () => {
    it("checks", () => {
      const instance = new NumberSpec();

      expect(instance.isEqual(1, 1)).toBe(true);
      expect(instance.isEqual(1, 2)).toBe(false);
      expect(instance.isEqual(Infinity, Infinity)).toBe(true);
      expect(instance.isEqual(-Infinity, Infinity)).toBe(false);

      expect(instance.isGreaterThan(20, 10)).toBe(true);
      expect(instance.isGreaterThan(10, 20)).toBe(false);
      expect(instance.isGreaterThan(10, 10)).toBe(false);
      expect(instance.isGreaterThan(10, -Infinity)).toBe(true);
      expect(instance.isGreaterThan(Infinity, 10)).toBe(true);
      expect(instance.isGreaterThan(10, Infinity)).toBe(false);
      expect(instance.isGreaterThan(-Infinity, 10)).toBe(false);
      expect(instance.isLessThan(10, 20)).toBe(true);
      expect(instance.isLessThan(20, 10)).toBe(false);
      expect(instance.isLessThan(10, 10)).toBe(false);
      expect(instance.isLessThan(10, -Infinity)).toBe(false);
      expect(instance.isLessThan(Infinity, 10)).toBe(false);
      expect(instance.isLessThan(10, Infinity)).toBe(true);
      expect(instance.isLessThan(-Infinity, 10)).toBe(true);

      expect(instance.isGreaterOrEqualTo(20, 10)).toBe(true);
      expect(instance.isGreaterOrEqualTo(10, 20)).toBe(false);
      expect(instance.isGreaterOrEqualTo(10, 10)).toBe(true);
      expect(instance.isGreaterOrEqualTo(10, -Infinity)).toBe(true);
      expect(instance.isGreaterOrEqualTo(Infinity, 10)).toBe(true);
      expect(instance.isGreaterOrEqualTo(10, Infinity)).toBe(false);
      expect(instance.isGreaterOrEqualTo(-Infinity, 10)).toBe(false);
      expect(instance.isLessOrEqualTo(10, 20)).toBe(true);
      expect(instance.isLessOrEqualTo(20, 10)).toBe(false);
      expect(instance.isLessOrEqualTo(10, 10)).toBe(true);
      expect(instance.isLessOrEqualTo(10, -Infinity)).toBe(false);
      expect(instance.isLessOrEqualTo(Infinity, 10)).toBe(false);
      expect(instance.isLessOrEqualTo(10, Infinity)).toBe(true);
      expect(instance.isLessOrEqualTo(-Infinity, 10)).toBe(true);

      expect(instance.isInfinity(Infinity)).toBe(true);
      expect(instance.isInfinity(-Infinity)).toBe(true);
      expect(instance.isInfinity(10)).toBe(false);
    });
  });
});
