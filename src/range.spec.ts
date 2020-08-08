import { Range } from "./range";

describe("Range", () => {
  describe("create", () => {
    it("open range", () => {
      const result = Range.open(10, 20);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(20);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("close range", () => {
      const result = Range.close(10, 20);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(20);
      expect(result.isLowerEnclosed).toBe(true);
      expect(result.isUpperEnclosed).toBe(true);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("open-close range", () => {
      const result = Range.openClose(10, 20);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(20);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(true);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("close-open range", () => {
      const result = Range.closeOpen(10, 20);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(20);
      expect(result.isLowerEnclosed).toBe(true);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("close singleton range", () => {
      const result = Range.close(10, 10);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(10);
      expect(result.isLowerEnclosed).toBe(true);
      expect(result.isUpperEnclosed).toBe(true);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("open-close singleton range", () => {
      const result = Range.openClose(9, 10);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(9);
      expect(result.upper).toBe(10);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(true);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("close-open singleton range", () => {
      const result = Range.closeOpen(10, 11);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(11);
      expect(result.isLowerEnclosed).toBe(true);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("infinity range (not singleton)", () => {
      const result = Range.open(-Infinity, Infinity);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(-Infinity);
      expect(result.upper).toBe(Infinity);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isLowerInfinity).toBe(true);
      expect(result.isUpperInfinity).toBe(true);
    });
    it("open-close infinity range", () => {
      const result = Range.openClose(-Infinity, 20);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(-Infinity);
      expect(result.upper).toBe(20);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(true);
      expect(result.isLowerInfinity).toBe(true);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("close-open infinity range", () => {
      const result = Range.closeOpen(20, Infinity);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(20);
      expect(result.upper).toBe(Infinity);
      expect(result.isLowerEnclosed).toBe(true);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(true);
    });
    it("close infinity range (must remain open on infinity sides)", () => {
      const result = Range.close(-Infinity, Infinity);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(-Infinity);
      expect(result.upper).toBe(Infinity);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isLowerInfinity).toBe(true);
      expect(result.isUpperInfinity).toBe(true);
    });
    it("empty range explicitly", () => {
      const result = Range.empty();
      expect(result.isEmpty).toBe(true);
      expect(result.lower).toBe(null);
      expect(result.upper).toBe(null);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("empty range implicitly", () => {
      const result = Range.open(5, 5);
      expect(result.isEmpty).toBe(true);
      expect(result.lower).toBe(5);
      expect(result.upper).toBe(5);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("invalid input refused", () => {
      expect(() => Range.open(10, 5)).toThrow(/greater than/);
      expect(() => Range.close(10, 5)).toThrow(/greater than/);
      expect(() => Range.openClose(10, 5)).toThrow(/greater than/);
      expect(() => Range.closeOpen(10, 5)).toThrow(/greater than/);
      expect(() => Range.open(Infinity, -Infinity)).toThrow(/greater than/);
      expect(() => Range.close(Infinity, -Infinity)).toThrow(/greater than/);
      expect(() => Range.openClose(Infinity, -Infinity)).toThrow(/greater than/);
      expect(() => Range.closeOpen(Infinity, -Infinity)).toThrow(/greater than/);
    });
  });
  describe("contains", () => {
    it.each`
      range1                             | range2
      ${Range.closeOpen(10, 20)}         | ${Range.closeOpen(15, 17)}
      ${Range.closeOpen(10, 20)}         | ${Range.closeOpen(10, 20)}
      ${Range.close(10, 20)}             | ${Range.closeOpen(10, 20)}
      ${Range.close(10, 20)}             | ${Range.openClose(10, 20)}
      ${Range.close(10, 20)}             | ${Range.open(10, 20)}
      ${Range.openClose(10, 20)}         | ${Range.close(20, 20)}
      ${Range.closeOpen(10, 20)}         | ${Range.close(10, 10)}
      ${Range.closeOpen(10, 20)}         | ${Range.open(5, 5)}
      ${Range.closeOpen(10, 20)}         | ${Range.open(1, 1)}
      ${Range.open(-Infinity, 20)}       | ${Range.closeOpen(15, 17)}
      ${Range.closeOpen(10, Infinity)}   | ${Range.closeOpen(15, 17)}
      ${Range.open(-Infinity, Infinity)} | ${Range.closeOpen(15, 17)}
      ${Range.open(-Infinity, 20)}       | ${Range.openClose(-Infinity, 17)}
      ${Range.closeOpen(10, Infinity)}   | ${Range.closeOpen(15, Infinity)}
      ${Range.open(-Infinity, Infinity)} | ${Range.open(-Infinity, Infinity)}
    `(
      "$range1 contains $range2",
      ({ range1, range2 }: { range1: Range<number>; range2: Range<number> }) => {
        expect(range1.contains(range2)).toBe(true);
      }
    );
    it.each`
      range1                     | range2
      ${Range.openClose(10, 20)} | ${Range.openClose(9, 10)}
      ${Range.openClose(10, 20)} | ${Range.openClose(20, 21)}
      ${Range.openClose(10, 20)} | ${Range.openClose(30, 40)}
      ${Range.openClose(10, 20)} | ${Range.openClose(0, 5)}
    `(
      "$range1 does not contain $range2",
      ({ range1, range2 }: { range1: Range<number>; range2: Range<number> }) => {
        expect(range1.contains(range2)).toBe(false);
      }
    );

    it.each`
      range                              | element
      ${Range.closeOpen(10, 20)}         | ${10}
      ${Range.openClose(10, 20)}         | ${20}
      ${Range.closeOpen(10, 20)}         | ${19}
      ${Range.openClose(10, 20)}         | ${11}
      ${Range.close(10, 20)}             | ${20}
      ${Range.close(10, 20)}             | ${10}
      ${Range.openClose(-Infinity, 20)}  | ${5}
      ${Range.closeOpen(10, Infinity)}   | ${15}
      ${Range.open(-Infinity, Infinity)} | ${500}
    `(
      "$range contains $element",
      ({ range, element }: { range: Range<number>; element: number }) => {
        expect(range.contains(element)).toBe(true);
      }
    );
    it.each`
      range                             | element
      ${Range.closeOpen(10, 20)}        | ${20}
      ${Range.openClose(10, 20)}        | ${10}
      ${Range.openClose(10, 20)}        | ${5}
      ${Range.openClose(10, 20)}        | ${30}
      ${Range.openClose(-Infinity, 10)} | ${15}
      ${Range.closeOpen(10, Infinity)}  | ${5}
    `(
      "$range does not contain $element",
      ({ range, element }: { range: Range<number>; element: number }) => {
        expect(range.contains(element)).toBe(false);
      }
    );
  });
  describe("equals", () => {
    it.each`
      value
      ${Range.close(10, 20)}
      ${Range.closeOpen(10, 20)}
      ${Range.openClose(10, 20)}
      ${Range.open(10, 20)}
      ${Range.openClose(-Infinity, 20)}
      ${Range.closeOpen(10, Infinity)}
      ${Range.open(-Infinity, Infinity)}
    `("$value equals $value", ({ value }: { value: Range<number> }) => {
      expect(value.equals(value)).toBe(true);
    });
    it.each`
      left                               | right
      ${Range.close(10, 20)}             | ${Range.openClose(15, 30)}
      ${Range.close(10, 20)}             | ${Range.close(1, 5)}
      ${Range.close(10, 20)}             | ${Range.open(30, 40)}
      ${Range.close(10, 20)}             | ${Range.open(10, 20)}
      ${Range.close(10, 20)}             | ${Range.closeOpen(10, 20)}
      ${Range.close(10, 20)}             | ${Range.closeOpen(10, 20)}
      ${Range.closeOpen(10, 20)}         | ${Range.close(10, 20)}
      ${Range.closeOpen(10, 20)}         | ${Range.openClose(10, 20)}
      ${Range.closeOpen(10, 20)}         | ${Range.open(10, 20)}
      ${Range.openClose(10, 20)}         | ${Range.close(10, 20)}
      ${Range.openClose(10, 20)}         | ${Range.closeOpen(10, 20)}
      ${Range.openClose(10, 20)}         | ${Range.open(10, 20)}
      ${Range.open(10, 20)}              | ${Range.close(10, 20)}
      ${Range.open(10, 20)}              | ${Range.closeOpen(10, 20)}
      ${Range.open(10, 20)}              | ${Range.closeOpen(10, 20)}
      ${Range.openClose(-Infinity, 20)}  | ${Range.openClose(-Infinity, 19)}
      ${Range.open(-Infinity, 20)}       | ${Range.openClose(-Infinity, 19)}
      ${Range.closeOpen(10, Infinity)}   | ${Range.open(11, Infinity)}
      ${Range.open(10, Infinity)}        | ${Range.closeOpen(11, Infinity)}
      ${Range.open(-Infinity, Infinity)} | ${Range.closeOpen(10, Infinity)}
      ${Range.open(-Infinity, Infinity)} | ${Range.open(-Infinity, 20)}
    `("$left != $right", ({ left, right }: { left: Range<number>; right: Range<number> }) => {
      expect(left.equals(right)).toBe(false);
    });
    it("different-valued empty ranges are equal", () => {
      expect(Range.open(10, 10).equals(Range.open(50, 50))).toBe(true);
    });
  });
  describe("adjacent", () => {
    it.each`
      range1                      | range2
      ${Range.open(10, 20)}       | ${Range.openClose(5, 10)}
      ${Range.close(10, 20)}      | ${Range.closeOpen(5, 10)}
      ${Range.open(10, Infinity)} | ${Range.openClose(5, 10)}
    `("$range1 is left adjacent to $range2", ({ range1, range2 }) => {
      expect(range1.adjacentLeft(range2)).toBe(true);
    });
    it.each`
      range1                       | range2
      ${Range.open(10, 20)}        | ${Range.open(5, 10)}
      ${Range.close(10, 20)}       | ${Range.close(5, 10)}
      ${Range.open(10, 20)}        | ${Range.close(20, 30)}
      ${Range.open(-Infinity, 20)} | ${Range.closeOpen(20, 30)}
    `("$range1 is not left adjacent to $range2", ({ range1, range2 }) => {
      expect(range1.adjacentLeft(range2)).toBe(false);
    });
    it.each`
      range1                       | range2
      ${Range.open(10, 20)}        | ${Range.closeOpen(20, 30)}
      ${Range.close(10, 20)}       | ${Range.open(20, 30)}
      ${Range.open(-Infinity, 20)} | ${Range.close(20, 30)}
    `("$range1 is right adjacent to $range2", ({ range1, range2 }) => {
      expect(range1.adjacentRight(range2)).toBe(true);
    });
    it.each`
      range1                      | range2
      ${Range.open(10, 20)}       | ${Range.open(20, 30)}
      ${Range.close(10, 20)}      | ${Range.close(20, 30)}
      ${Range.open(10, 20)}       | ${Range.close(5, 10)}
      ${Range.open(10, Infinity)} | ${Range.closeOpen(20, 30)}
    `("$range1 is not right adjacent to $range2", ({ range1, range2 }) => {
      expect(range1.adjacentRight(range2)).toBe(false);
    });
  });
  describe("intersection", () => {
    it.each`
      range1                     | range2                     | expected
      ${Range.empty()}           | ${Range.empty()}           | ${Range.empty()}
      ${Range.open(10, 20)}      | ${Range.empty()}           | ${Range.empty()}
      ${Range.close(10, 20)}     | ${Range.empty()}           | ${Range.empty()}
      ${Range.openClose(10, 20)} | ${Range.empty()}           | ${Range.empty()}
      ${Range.closeOpen(10, 20)} | ${Range.empty()}           | ${Range.empty()}
      ${Range.open(10, 20)}      | ${Range.open(15, 30)}      | ${Range.open(15, 20)}
      ${Range.close(10, 20)}     | ${Range.close(15, 30)}     | ${Range.close(15, 20)}
      ${Range.openClose(10, 20)} | ${Range.openClose(15, 30)} | ${Range.openClose(15, 20)}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(15, 30)} | ${Range.closeOpen(15, 20)}
      ${Range.open(15, 30)}      | ${Range.open(10, 20)}      | ${Range.open(15, 20)}
      ${Range.close(15, 30)}     | ${Range.close(10, 20)}     | ${Range.close(15, 20)}
      ${Range.openClose(15, 30)} | ${Range.openClose(10, 20)} | ${Range.openClose(15, 20)}
      ${Range.closeOpen(15, 30)} | ${Range.closeOpen(10, 20)} | ${Range.closeOpen(15, 20)}
      ${Range.open(10, 20)}      | ${Range.open(10, 20)}      | ${Range.open(10, 20)}
      ${Range.close(10, 20)}     | ${Range.close(10, 20)}     | ${Range.close(10, 20)}
      ${Range.openClose(10, 20)} | ${Range.openClose(10, 20)} | ${Range.openClose(10, 20)}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(10, 20)} | ${Range.closeOpen(10, 20)}
      ${Range.close(10, 20)}     | ${Range.open(10, 20)}      | ${Range.open(10, 20)}
      ${Range.open(10, 20)}      | ${Range.close(10, 20)}     | ${Range.open(10, 20)}
      ${Range.openClose(10, 20)} | ${Range.closeOpen(10, 20)} | ${Range.open(10, 20)}
      ${Range.closeOpen(10, 20)} | ${Range.openClose(10, 20)} | ${Range.open(10, 20)}
      ${Range.close(10, 20)}     | ${Range.close(20, 30)}     | ${Range.singleton(20)}
      ${Range.openClose(10, 20)} | ${Range.openClose(20, 30)} | ${Range.empty()}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(20, 30)} | ${Range.empty()}
      ${Range.close(10, 20)}     | ${Range.open(20, 30)}      | ${Range.empty()}
      ${Range.open(10, 20)}      | ${Range.close(20, 30)}     | ${Range.empty()}
      ${Range.open(10, 20)}      | ${Range.open(20, 30)}      | ${Range.empty()}
      ${Range.close(10, 20)}     | ${Range.close(30, 40)}     | ${Range.empty()}
    `("$range1 * $range2 = $expected", ({ range1, range2, expected }) => {
      const result = range1.intersection(range2);
      expect(result.equals(expected)).toBe(true);
    });
  });
  describe("union", () => {
    it.each`
      range1                     | range2                     | expected
      ${Range.open(10, 20)}      | ${Range.open(15, 30)}      | ${Range.open(10, 30)}
      ${Range.close(10, 20)}     | ${Range.close(15, 30)}     | ${Range.close(10, 30)}
      ${Range.openClose(10, 20)} | ${Range.openClose(15, 30)} | ${Range.openClose(10, 30)}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(15, 30)} | ${Range.closeOpen(10, 30)}
      ${Range.open(15, 30)}      | ${Range.open(10, 20)}      | ${Range.open(10, 30)}
      ${Range.close(15, 30)}     | ${Range.close(10, 20)}     | ${Range.close(10, 30)}
      ${Range.openClose(15, 30)} | ${Range.openClose(10, 20)} | ${Range.openClose(10, 30)}
      ${Range.closeOpen(15, 30)} | ${Range.closeOpen(10, 20)} | ${Range.closeOpen(10, 30)}
      ${Range.open(10, 20)}      | ${Range.open(10, 20)}      | ${Range.open(10, 20)}
      ${Range.close(10, 20)}     | ${Range.close(10, 20)}     | ${Range.close(10, 20)}
      ${Range.openClose(10, 20)} | ${Range.openClose(10, 20)} | ${Range.openClose(10, 20)}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(10, 20)} | ${Range.closeOpen(10, 20)}
      ${Range.close(10, 20)}     | ${Range.open(10, 20)}      | ${Range.close(10, 20)}
      ${Range.open(10, 20)}      | ${Range.close(10, 20)}     | ${Range.close(10, 20)}
      ${Range.openClose(10, 20)} | ${Range.closeOpen(10, 20)} | ${Range.close(10, 20)}
      ${Range.closeOpen(10, 20)} | ${Range.openClose(10, 20)} | ${Range.close(10, 20)}
      ${Range.openClose(10, 20)} | ${Range.openClose(20, 30)} | ${Range.openClose(10, 30)}
      ${Range.open(10, 20)}      | ${Range.empty()}           | ${Range.open(10, 20)}
      ${Range.close(10, 20)}     | ${Range.empty()}           | ${Range.close(10, 20)}
      ${Range.openClose(10, 20)} | ${Range.empty()}           | ${Range.openClose(10, 20)}
      ${Range.closeOpen(10, 20)} | ${Range.empty()}           | ${Range.closeOpen(10, 20)}
      ${Range.empty()}           | ${Range.open(10, 20)}      | ${Range.open(10, 20)}
      ${Range.empty()}           | ${Range.close(10, 20)}     | ${Range.close(10, 20)}
      ${Range.empty()}           | ${Range.openClose(10, 20)} | ${Range.openClose(10, 20)}
      ${Range.empty()}           | ${Range.closeOpen(10, 20)} | ${Range.closeOpen(10, 20)}
    `("$range1 + $range2 = $expected", ({ range1, range2, expected }) => {
      const result = range1.union(range2);
      expect(result).toEqual(expected);
    });
    it.each`
      range1                | range2
      ${Range.open(10, 20)} | ${Range.open(30, 40)}
      ${Range.open(10, 20)} | ${Range.open(20, 30)}
      ${Range.open(20, 30)} | ${Range.open(10, 20)}
      ${Range.open(20, 30)} | ${Range.open(10, 20)}
    `("refuse to union non-intersecting ranges", ({ range1, range2 }) => {
      expect(() => range1.union(range2)).toThrow(/non-intersecting/);
    });
  });
  describe("subtract", () => {
    it.each`
      range1                     | range2                     | expected
      ${Range.empty()}           | ${Range.empty()}           | ${[Range.empty()]}
      ${Range.openClose(10, 20)} | ${Range.empty()}           | ${[Range.openClose(10, 20)]}
      ${Range.openClose(10, 20)} | ${Range.open(20, 30)}      | ${[Range.openClose(10, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.open(20, 30)}      | ${[Range.closeOpen(10, 20)]}
      ${Range.open(10, 20)}      | ${Range.open(20, 30)}      | ${[Range.open(10, 20)]}
      ${Range.close(10, 20)}     | ${Range.open(20, 30)}      | ${[Range.close(10, 20)]}
      ${Range.openClose(10, 20)} | ${Range.openClose(20, 30)} | ${[Range.openClose(10, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.openClose(20, 30)} | ${[Range.closeOpen(10, 20)]}
      ${Range.open(10, 20)}      | ${Range.openClose(20, 30)} | ${[Range.open(10, 20)]}
      ${Range.close(10, 20)}     | ${Range.openClose(20, 30)} | ${[Range.close(10, 20)]}
      ${Range.openClose(10, 20)} | ${Range.close(20, 30)}     | ${[Range.open(10, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.close(20, 30)}     | ${[Range.closeOpen(10, 20)]}
      ${Range.open(10, 20)}      | ${Range.close(20, 30)}     | ${[Range.open(10, 20)]}
      ${Range.close(10, 20)}     | ${Range.close(20, 30)}     | ${[Range.closeOpen(10, 20)]}
      ${Range.openClose(10, 20)} | ${Range.closeOpen(20, 30)} | ${[Range.open(10, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(20, 30)} | ${[Range.closeOpen(10, 20)]}
      ${Range.open(10, 20)}      | ${Range.closeOpen(20, 30)} | ${[Range.open(10, 20)]}
      ${Range.close(10, 20)}     | ${Range.closeOpen(20, 30)} | ${[Range.closeOpen(10, 20)]}
      ${Range.openClose(10, 20)} | ${Range.open(1, 10)}       | ${[Range.openClose(10, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.open(1, 10)}       | ${[Range.closeOpen(10, 20)]}
      ${Range.open(10, 20)}      | ${Range.open(1, 10)}       | ${[Range.open(10, 20)]}
      ${Range.close(10, 20)}     | ${Range.open(1, 10)}       | ${[Range.close(10, 20)]}
      ${Range.openClose(10, 20)} | ${Range.openClose(1, 10)}  | ${[Range.openClose(10, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.openClose(1, 10)}  | ${[Range.open(10, 20)]}
      ${Range.open(10, 20)}      | ${Range.openClose(1, 10)}  | ${[Range.open(10, 20)]}
      ${Range.close(10, 20)}     | ${Range.openClose(1, 10)}  | ${[Range.openClose(10, 20)]}
      ${Range.openClose(10, 20)} | ${Range.close(1, 10)}      | ${[Range.openClose(10, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.close(1, 10)}      | ${[Range.open(10, 20)]}
      ${Range.open(10, 20)}      | ${Range.close(1, 10)}      | ${[Range.open(10, 20)]}
      ${Range.close(10, 20)}     | ${Range.close(1, 10)}      | ${[Range.openClose(10, 20)]}
      ${Range.openClose(10, 20)} | ${Range.closeOpen(1, 10)}  | ${[Range.openClose(10, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(1, 10)}  | ${[Range.closeOpen(10, 20)]}
      ${Range.open(10, 20)}      | ${Range.closeOpen(1, 10)}  | ${[Range.open(10, 20)]}
      ${Range.close(10, 20)}     | ${Range.closeOpen(1, 10)}  | ${[Range.close(10, 20)]}
      ${Range.openClose(10, 20)} | ${Range.open(14, 16)}      | ${[Range.openClose(10, 14), Range.close(16, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.open(14, 16)}      | ${[Range.close(10, 14), Range.closeOpen(16, 20)]}
      ${Range.open(10, 20)}      | ${Range.open(14, 16)}      | ${[Range.openClose(10, 14), Range.closeOpen(16, 20)]}
      ${Range.close(10, 20)}     | ${Range.open(14, 16)}      | ${[Range.close(10, 14), Range.close(16, 20)]}
      ${Range.openClose(10, 20)} | ${Range.openClose(14, 16)} | ${[Range.openClose(10, 14), Range.openClose(16, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.openClose(14, 16)} | ${[Range.close(10, 14), Range.open(16, 20)]}
      ${Range.open(10, 20)}      | ${Range.openClose(14, 16)} | ${[Range.openClose(10, 14), Range.open(16, 20)]}
      ${Range.close(10, 20)}     | ${Range.openClose(14, 16)} | ${[Range.close(10, 14), Range.openClose(16, 20)]}
      ${Range.openClose(10, 20)} | ${Range.close(14, 16)}     | ${[Range.open(10, 14), Range.openClose(16, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.close(14, 16)}     | ${[Range.closeOpen(10, 14), Range.open(16, 20)]}
      ${Range.open(10, 20)}      | ${Range.close(14, 16)}     | ${[Range.open(10, 14), Range.open(16, 20)]}
      ${Range.close(10, 20)}     | ${Range.close(14, 16)}     | ${[Range.closeOpen(10, 14), Range.openClose(16, 20)]}
      ${Range.openClose(10, 20)} | ${Range.closeOpen(14, 16)} | ${[Range.open(10, 14), Range.close(16, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(14, 16)} | ${[Range.closeOpen(10, 14), Range.closeOpen(16, 20)]}
      ${Range.open(10, 20)}      | ${Range.closeOpen(14, 16)} | ${[Range.open(10, 14), Range.closeOpen(16, 20)]}
      ${Range.close(10, 20)}     | ${Range.closeOpen(14, 16)} | ${[Range.closeOpen(10, 14), Range.close(16, 20)]}
      ${Range.openClose(10, 20)} | ${Range.open(10, 16)}      | ${[Range.close(16, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.open(10, 16)}      | ${[Range.singleton(10), Range.closeOpen(16, 20)]}
      ${Range.open(10, 20)}      | ${Range.open(10, 16)}      | ${[Range.closeOpen(16, 20)]}
      ${Range.close(10, 20)}     | ${Range.open(10, 16)}      | ${[Range.singleton(10), Range.close(16, 20)]}
      ${Range.openClose(10, 20)} | ${Range.openClose(10, 16)} | ${[Range.openClose(16, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.openClose(10, 16)} | ${[Range.singleton(10), Range.open(16, 20)]}
      ${Range.open(10, 20)}      | ${Range.openClose(10, 16)} | ${[Range.open(16, 20)]}
      ${Range.close(10, 20)}     | ${Range.openClose(10, 16)} | ${[Range.singleton(10), Range.openClose(16, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.close(10, 16)}     | ${[Range.open(16, 20)]}
      ${Range.close(10, 20)}     | ${Range.close(10, 16)}     | ${[Range.openClose(16, 20)]}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(10, 16)} | ${[Range.closeOpen(16, 20)]}
      ${Range.close(10, 20)}     | ${Range.closeOpen(10, 16)} | ${[Range.close(16, 20)]}
      ${Range.openClose(10, 20)} | ${Range.open(14, 20)}      | ${[Range.openClose(10, 14), Range.singleton(20)]}
      ${Range.closeOpen(10, 20)} | ${Range.open(14, 20)}      | ${[Range.close(10, 14)]}
      ${Range.open(10, 20)}      | ${Range.open(14, 20)}      | ${[Range.openClose(10, 14)]}
      ${Range.close(10, 20)}     | ${Range.open(14, 20)}      | ${[Range.close(10, 14), Range.singleton(20)]}
      ${Range.openClose(10, 20)} | ${Range.openClose(14, 20)} | ${[Range.openClose(10, 14)]}
      ${Range.close(10, 20)}     | ${Range.openClose(14, 20)} | ${[Range.close(10, 14)]}
      ${Range.openClose(10, 20)} | ${Range.close(14, 20)}     | ${[Range.open(10, 14)]}
      ${Range.close(10, 20)}     | ${Range.close(14, 20)}     | ${[Range.closeOpen(10, 14)]}
      ${Range.openClose(10, 20)} | ${Range.closeOpen(14, 20)} | ${[Range.open(10, 14), Range.singleton(20)]}
      ${Range.closeOpen(10, 20)} | ${Range.closeOpen(14, 20)} | ${[Range.closeOpen(10, 14)]}
      ${Range.open(10, 20)}      | ${Range.closeOpen(14, 20)} | ${[Range.open(10, 14)]}
      ${Range.close(10, 20)}     | ${Range.closeOpen(14, 20)} | ${[Range.closeOpen(10, 14), Range.singleton(20)]}
    `("$range1 - $range2 = $result", ({ range1, range2, expected }) => {
      const result = range1.subtract(range2);
      expect(result).toEqual(expected);
    });
  });
  describe("toString", () => {
    it.each`
      value                              | expected
      ${Range.open(10, 20)}              | ${"(10; 20)"}
      ${Range.close(10, 20)}             | ${"[10; 20]"}
      ${Range.openClose(10, 20)}         | ${"(10; 20]"}
      ${Range.closeOpen(10, 20)}         | ${"[10; 20)"}
      ${Range.openClose(-20, -10)}       | ${"(-20; -10]"}
      ${Range.singleton(50)}             | ${"[50; 50]"}
      ${Range.empty()}                   | ${"{}"}
      ${Range.open(-Infinity, Infinity)} | ${"(-Infinity; Infinity)"}
    `("should serialise into $expected", ({ value, expected }) => {
      expect(value.toString()).toEqual(expected);
    });
  });
});
