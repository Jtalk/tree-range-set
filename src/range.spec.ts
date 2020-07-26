import { Range } from "./range";
import { NumberSpec } from "./range-spec";
describe("Range", () => {
  describe("create", () => {
    it("creates open range", () => {
      const result = Range.open(10, 20);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(20);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isSingleton).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("creates close range", () => {
      const result = Range.close(10, 20);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(20);
      expect(result.isLowerEnclosed).toBe(true);
      expect(result.isUpperEnclosed).toBe(true);
      expect(result.isSingleton).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("creates open-close range", () => {
      const result = Range.openClose(10, 20);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(20);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(true);
      expect(result.isSingleton).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("creates close-open range", () => {
      const result = Range.closeOpen(10, 20);
      expect(result.isEmpty).toBe(false);
      expect(result.lower).toBe(10);
      expect(result.upper).toBe(20);
      expect(result.isLowerEnclosed).toBe(true);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isSingleton).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("creates empty range explicitly", () => {
      const result = Range.empty(new NumberSpec());
      expect(result.isEmpty).toBe(true);
      expect(result.lower).toBe(1);
      expect(result.upper).toBe(1);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isSingleton).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
    it("creates empty range implicitly", () => {
      const result = Range.open(5, 5);
      expect(result.isEmpty).toBe(true);
      expect(result.lower).toBe(5);
      expect(result.upper).toBe(5);
      expect(result.isLowerEnclosed).toBe(false);
      expect(result.isUpperEnclosed).toBe(false);
      expect(result.isSingleton).toBe(false);
      expect(result.isLowerInfinity).toBe(false);
      expect(result.isUpperInfinity).toBe(false);
    });
  });
});
