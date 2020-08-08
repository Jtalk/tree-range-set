import { Range } from "./range";
import { RangeSet } from "./range-set";
import { BintreeRangeSetTree } from "./range-set-tree-bintree";
import { RangeSpec, AbstractRangeSpec } from "./range-spec";

describe("RangeSet", () => {
  describe("empty", () => {
    it("should produce empty set of ranges", () => {
      expect(RangeSet.numeric().isEmpty).toBe(true);
      expect(RangeSet.numeric().add(Range.open(1, 2)).isEmpty).toBe(false);
      expect(RangeSet.numeric().subranges).toHaveLength(0);
    });
  });
  describe("add", () => {
    it("adding a range should produce the same range", () => {
      const instance = RangeSet.numeric();
      const value = Range.open(10, 20);
      const self = instance.add(value);
      expect(self).toBe(instance);
      expect(instance.subranges).toEqual([value]);
    });
    it("adding multiple non-intersecting ranges should produce the same set", () => {
      const instance = RangeSet.numeric();
      const values = [
        Range.open(10, 20),
        Range.closeOpen(30, 40),
        Range.openClose(50, 60),
        Range.close(70, 80),
      ];
      values.forEach((v) => instance.add(v));
      expect(instance.subranges).toEqual(values);
    });
    it("adding multiple intersecting/adjacent ranges should produce the unified result", () => {
      const instance = RangeSet.numeric();
      const values = [
        Range.open(10, 20),
        Range.openClose(20, 30),
        Range.closeOpen(30, 40),
        Range.close(40, 50),
        Range.close(51, 60),
      ];
      const expected = [Range.open(10, 20), Range.openClose(20, 50), Range.close(51, 60)];
      values.forEach((v) => instance.add(v));
      expect(instance.subranges).toEqual(expected);
    });
    it("the resulting range should not depend on the order of addition", () => {
      const instance = RangeSet.numeric();
      const values = [
        Range.closeOpen(30, 40),
        Range.close(51, 60),
        Range.open(10, 20),
        Range.openClose(20, 30),
        Range.close(40, 50),
      ];
      const expected = [Range.open(10, 20), Range.openClose(20, 50), Range.close(51, 60)];
      values.forEach((v) => instance.add(v));
      expect(instance.subranges).toEqual(expected);
    });
    it("should ignore empty ranges", () => {
      const instance = RangeSet.numeric();
      const value = Range.open(10, 20);
      instance.add(value);
      instance.add(Range.empty<number>());
      instance.add(Range.closeOpen(50, 50));
      expect(instance.subranges).toEqual([value]);
    });
    it("should add another set, merging relevant ranges", () => {
      const instance = RangeSet.numeric();
      const other = RangeSet.numeric();
      instance.add(Range.closeOpen(30, 40));
      instance.add(Range.open(10, 20));
      other.add(Range.close(51, 60));
      other.add(Range.openClose(20, 30));
      other.add(Range.close(40, 50));

      const expected = [Range.open(10, 20), Range.openClose(20, 50), Range.close(51, 60)];
      const self = instance.add(other);
      expect(self).toBe(instance);
      expect(instance.subranges).toEqual(expected);
    });
  });
  describe("subtract", () => {
    it("subtracting an empty range from an empty range should produce the same range", () => {
      const instance = RangeSet.numeric();
      const self = instance.subtract(Range.empty<number>());
      expect(self).toBe(instance);
      expect(instance.subranges).toEqual([]);
      expect(instance.isEmpty).toBe(true);
    });
    it("subtracting from an empty range should produce the same range", () => {
      const instance = RangeSet.numeric();
      const self = instance.subtract(Range.open(10, 20));
      expect(self).toBe(instance);
      expect(instance.subranges).toEqual([]);
      expect(instance.isEmpty).toBe(true);
    });
    it("subtracting a non-intersecting range should produce the same range", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.open(10, 20));
      instance.subtract(Range.open(20, 30));
      expect(instance.subranges).toEqual([Range.open(10, 20)]);
    });
    it("subtracting a contained range should split the original set", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.open(10, 20));
      instance.subtract(Range.open(15, 17));
      expect(instance.subranges).toEqual([Range.openClose(10, 15), Range.closeOpen(17, 20)]);
    });
    it("subtracting a same-lower range should only return the right part", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.open(10, 20));
      instance.subtract(Range.open(10, 17));
      expect(instance.subranges).toEqual([Range.closeOpen(17, 20)]);
    });
    it("subtracting a same-upper range should only return the left part", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.open(10, 20));
      instance.subtract(Range.open(15, 20));
      expect(instance.subranges).toEqual([Range.openClose(10, 15)]);
    });
    it("subtracting multiple intersecting ranges should remove both", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.openClose(10, 40));
      instance.subtract(Range.openClose(20, 30));
      instance.subtract(Range.closeOpen(30, 40));
      expect(instance.subranges).toEqual([Range.openClose(10, 20), Range.singleton(40)]);
    });
    it("subtracting multiple intersecting/adjacent ranges should produce the unified result", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.openClose(10, 60));
      const values = [
        Range.open(10, 20),
        Range.openClose(20, 30),
        Range.closeOpen(30, 40),
        Range.close(40, 50),
        Range.closeOpen(51, 60),
      ];
      values.forEach((v) => instance.subtract(v));
      const expected = [Range.singleton(20), Range.open(50, 51), Range.singleton(60)];
      expect(instance.subranges).toEqual(expected);
    });
    it("the resulting range should not depend on the order of subtraction", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.openClose(10, 60));
      const values = [
        Range.closeOpen(30, 40),
        Range.closeOpen(51, 60),
        Range.open(10, 20),
        Range.close(40, 50),
        Range.openClose(20, 30),
      ];
      values.forEach((v) => instance.subtract(v));
      const expected = [Range.singleton(20), Range.open(50, 51), Range.singleton(60)];
      expect(instance.subranges).toEqual(expected);
    });
    it("should ignore empty ranges", () => {
      const instance = RangeSet.numeric();
      const value = Range.open(10, 20);
      instance.add(value);
      instance.subtract(Range.empty<number>());
      instance.subtract(Range.closeOpen(50, 50));
      expect(instance.subranges).toEqual([value]);
    });
    it("should subtract another set, handling relevant ranges", () => {
      const instance = RangeSet.numeric();
      const other = RangeSet.numeric();
      instance.add(Range.openClose(10, 60));
      const values = [
        Range.open(10, 20),
        Range.openClose(20, 30),
        Range.closeOpen(30, 40),
        Range.close(40, 50),
        Range.closeOpen(51, 60),
      ];
      values.forEach((v) => other.add(v));
      instance.subtract(other);
      const expected = [Range.singleton(20), Range.open(50, 51), Range.singleton(60)];
      expect(instance.subranges).toEqual(expected);
    });
  });
  describe("contains", () => {
    it("empty range contains nothing but an empty range", () => {
      const instance = RangeSet.numeric();
      expect(instance.contains(0)).toBe(false);
      expect(instance.contains(Range.openClose(1, 5))).toBe(false);
      expect(instance.add(Range.openClose(10, 10)).contains(10)).toBe(false);
    });
    it("any range contains an empty range", () => {
      const instance = RangeSet.numeric();
      expect(instance.contains(Range.empty<number>())).toBe(true);
      expect(instance.contains(Range.openClose(5, 5))).toBe(true);

      instance.add(Range.openClose(10, 20));
      expect(instance.contains(Range.empty<number>())).toBe(true);
      expect(instance.contains(Range.openClose(5, 5))).toBe(true);
    });
    it("basic containment checks", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.closeOpen(10, 20));

      expect(instance.contains(0)).toBe(false);
      expect(instance.contains(10)).toBe(true);
      expect(instance.contains(20)).toBe(false);
      expect(instance.contains(21)).toBe(false);
      expect(instance.contains(150)).toBe(false);
      expect(instance.contains(Range.open(5, 7))).toBe(false);
      expect(instance.contains(Range.open(12, 15))).toBe(true);
      expect(instance.contains(Range.close(12, 15))).toBe(true);
      expect(instance.contains(Range.open(10, 20))).toBe(true);
      expect(instance.contains(Range.closeOpen(10, 20))).toBe(true);
      expect(instance.contains(Range.singleton(20))).toBe(false);
      expect(instance.contains(Range.closeOpen(15, 25))).toBe(false);
      expect(instance.contains(Range.closeOpen(50, 55))).toBe(false);

      instance.clear();
      instance.add(Range.openClose(10, 20));
      instance.add(Range.closeOpen(50, 60));
      instance.add(Range.open(100, 120));
      instance.add(Range.singleton(49));

      expect(instance.contains(0)).toBe(false);
      expect(instance.contains(10)).toBe(false);
      expect(instance.contains(20)).toBe(true);
      expect(instance.contains(48)).toBe(false);
      expect(instance.contains(49)).toBe(true);
      expect(instance.contains(49.5)).toBe(false);
      expect(instance.contains(50)).toBe(true);
      expect(instance.contains(60)).toBe(false);
      expect(instance.contains(100)).toBe(false);
      expect(instance.contains(120)).toBe(false);
      expect(instance.contains(149)).toBe(false);
      expect(instance.contains(Range.singleton(10))).toBe(false);
      expect(instance.contains(Range.open(12, 15))).toBe(true);
      expect(instance.contains(Range.close(12, 15))).toBe(true);
      expect(instance.contains(Range.open(10, 20))).toBe(true);
      expect(instance.contains(Range.openClose(10, 20))).toBe(true);
      expect(instance.contains(Range.singleton(20))).toBe(true);
      expect(instance.contains(Range.singleton(48))).toBe(false);
      expect(instance.contains(Range.singleton(49))).toBe(true);
      expect(instance.contains(Range.closeOpen(101, 120))).toBe(true);
      expect(instance.contains(Range.closeOpen(150, 155))).toBe(false);
    });
    it("singleton range contains its value", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.singleton(10));

      expect(instance.contains(10)).toBe(true);
      expect(instance.contains(9)).toBe(false);
      expect(instance.contains(11)).toBe(false);
      expect(instance.contains(Range.singleton(10))).toBe(true);
    });
  });
  describe("containing", () => {
    it("empty range contains nothing", () => {
      const instance = RangeSet.numeric();

      expect(instance.containing(0)).toBeUndefined();
      expect(instance.containing(10)).toBeUndefined();
    });
    it("basic containing checks", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.openClose(10, 20));
      instance.add(Range.closeOpen(50, 60));
      instance.add(Range.open(100, 120));
      instance.add(Range.singleton(49));

      expect(instance.containing(0)).toBeUndefined();
      expect(instance.containing(10)).toBeUndefined();
      expect(instance.containing(60)).toBeUndefined();
      expect(instance.containing(100)).toBeUndefined();
      expect(instance.containing(120)).toBeUndefined();
      expect(instance.containing(150)).toBeUndefined();

      expect(instance.containing(20)).toEqual(Range.openClose(10, 20));
      expect(instance.containing(11)).toEqual(Range.openClose(10, 20));
      expect(instance.containing(16)).toEqual(Range.openClose(10, 20));

      expect(instance.containing(50)).toEqual(Range.closeOpen(50, 60));
      expect(instance.containing(59)).toEqual(Range.closeOpen(50, 60));
      expect(instance.containing(54)).toEqual(Range.closeOpen(50, 60));

      expect(instance.containing(101)).toEqual(Range.open(100, 120));
      expect(instance.containing(119)).toEqual(Range.open(100, 120));
      expect(instance.containing(115)).toEqual(Range.open(100, 120));

      expect(instance.containing(49)).toEqual(Range.singleton(49));
    });
  });
  describe("enclosing", () => {
    it("nothing encloses an empty range", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.openClose(10, 20));

      expect(instance.enclosing(Range.empty<number>())).toBeUndefined();
      expect(instance.enclosing(Range.openClose(11, 11))).toBeUndefined();
    });
    it("empty range encloses nothing", () => {
      const instance = RangeSet.numeric();

      expect(instance.enclosing(Range.empty<number>())).toBeUndefined();
      expect(instance.enclosing(Range.openClose(11, 11))).toBeUndefined();
      expect(instance.enclosing(Range.openClose(10, 20))).toBeUndefined();
    });
    it("basic enclosing checks", () => {
      const instance = RangeSet.numeric();
      instance.add(Range.closeOpen(10, 20));

      expect(instance.enclosing(Range.open(5, 7))).toBeUndefined();
      expect(instance.enclosing(Range.open(12, 15))).toEqual(Range.closeOpen(10, 20));
      expect(instance.enclosing(Range.close(12, 15))).toEqual(Range.closeOpen(10, 20));
      expect(instance.enclosing(Range.open(10, 20))).toEqual(Range.closeOpen(10, 20));
      expect(instance.enclosing(Range.closeOpen(10, 20))).toEqual(Range.closeOpen(10, 20));
      expect(instance.enclosing(Range.singleton(20))).toBeUndefined();
      expect(instance.enclosing(Range.closeOpen(15, 25))).toBeUndefined();
      expect(instance.enclosing(Range.closeOpen(50, 55))).toBeUndefined();

      instance.clear();
      instance.add(Range.openClose(10, 20));
      instance.add(Range.closeOpen(50, 60));
      instance.add(Range.open(100, 120));
      instance.add(Range.singleton(49));

      expect(instance.enclosing(Range.singleton(10))).toBeUndefined();
      expect(instance.enclosing(Range.open(12, 15))).toEqual(Range.openClose(10, 20));
      expect(instance.enclosing(Range.close(12, 15))).toEqual(Range.openClose(10, 20));
      expect(instance.enclosing(Range.open(10, 20))).toEqual(Range.openClose(10, 20));
      expect(instance.enclosing(Range.openClose(10, 20))).toEqual(Range.openClose(10, 20));
      expect(instance.enclosing(Range.singleton(20))).toEqual(Range.openClose(10, 20));
      expect(instance.enclosing(Range.singleton(48))).toBeUndefined();
      expect(instance.enclosing(Range.singleton(49))).toEqual(Range.singleton(49));
      expect(instance.enclosing(Range.closeOpen(101, 120))).toEqual(Range.open(100, 120));
      expect(instance.enclosing(Range.closeOpen(150, 155))).toBeUndefined();
    });
  });
  describe("BTree-based implementation", () => {
    const instance = RangeSet.numeric(BintreeRangeSetTree);
    instance.add(Range.closeOpen(30, 40));
    instance.add(Range.openClose(10, 20));
    instance.add(Range.close(50, 60));
    instance.add(Range.singleton(45));

    instance.subtract(Range.open(15, 35));
    instance.subtract(Range.singleton(54));
    instance.subtract(Range.open(39, 51));

    expect(instance.subranges).toEqual([
      Range.openClose(10, 15),
      Range.close(35, 39),
      Range.closeOpen(51, 54),
      Range.openClose(54, 60),
    ]);
  });
  describe("custom type", () => {
    class DateSpec extends AbstractRangeSpec<Date> implements RangeSpec<Date> {
      unit(): Date {
        return new Date(1);
      }
      plus(a: Date, b: Date): Date {
        return new Date(a.getTime() + b.getTime());
      }
      minus(a: Date, b: Date): Date {
        return new Date(a.getTime() - b.getTime());
      }
      get comparator(): (a: Date, b: Date) => number {
        return (a, b) => a.getTime() - b.getTime();
      }
      isInfinity(value: Date): boolean {
        return false;
      }
    }
    const spec = new DateSpec();
    const instance = RangeSet.of(spec);
    instance.add(
      Range.closeOpen(new Date("2020-07-01T12:00:00Z"), new Date("2020-07-01T18:00:00Z"), spec)
    );
    instance.add(
      Range.closeOpen(new Date("2020-07-02T12:00:00Z"), new Date("2020-07-02T18:00:00Z"), spec)
    );
    instance.add(
      Range.closeOpen(new Date("2020-07-03T12:00:00Z"), new Date("2020-07-03T18:00:00Z"), spec)
    );
    instance.subtract(
      Range.closeOpen(new Date("2020-07-01T17:00:00Z"), new Date("2020-07-03T13:00:00Z"), spec)
    );

    expect(instance.subranges).toEqual([
      Range.closeOpen(new Date("2020-07-01T12:00:00Z"), new Date("2020-07-01T17:00:00Z"), spec),
      Range.closeOpen(new Date("2020-07-03T13:00:00Z"), new Date("2020-07-03T18:00:00Z"), spec),
    ]);
  });
});
