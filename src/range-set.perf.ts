import * as Benchmark from "benchmark";
import { Range } from "./range";
import { RangeSet } from "./range-set";
import * as DRange from "drange";
import { default as rangeSet } from "range-set";

console.log("Running RangeSet performance check");

const suite = new Benchmark.Suite();

const ops = makeOps();

suite.add("drange", () => {
  const instance = new DRange();
  ops.forEach((op) => {
    op.add.forEach((r) => instance.add(r.lower, r.upper));
    op.subtract.forEach((r) => instance.subtract(r.lower, r.upper));
  });
});

const rangeSetModule = rangeSet({
  compare: (a, b) => a - b,
  isNegativeInfinity: (v) => v === -Infinity,
  isPositiveInfinity: (v) => v === Infinity,
  negativeInfinity: -Infinity,
  positiveInfinity: Infinity,
});
suite.add("range-set", () => {
  let instance = rangeSetModule.and([]);
  ops.forEach((op) => {
    op.add.forEach((r) => {
      instance = rangeSetModule.or(instance, rangeSetModule.range(r.lower, r.upper, true, true));
    });
    op.subtract.forEach((r) => {
      instance = rangeSetModule.and(
        rangeSetModule.not(rangeSetModule.range(r.lower, r.upper, true, true)),
        instance
      );
    });
  });
});

suite.add("tree-range-set", () => {
  const instance = RangeSet.numeric();
  ops.forEach((op) => {
    op.add.forEach((r) => instance.add(r));
    op.subtract.forEach((r) => instance.subtract(r));
  });
});

suite.on("cycle", function (event) {
  console.log(String(event.target));
});

suite.run();

function makeOps() {
  const singleOp = {
    add: [Range.close(0, 20), Range.close(30, 31), Range.singleton(3), Range.close(22, 31)],
    subtract: [Range.close(18, 22), Range.singleton(30), Range.close(1, 7), Range.singleton(31)],
  };
  return Array(1000)
    .fill(0)
    .map((_, i) => ({
      add: singleOp.add.map((r) => Range.close(r.lower + i * 32, r.upper + i * 32)),
      subtract: singleOp.subtract.map((r) => Range.close(r.lower + i * 32, r.upper + i * 32)),
    }));
}
