# Tree RangeSet

![build](https://github.com/Jtalk/tree-range-set/workflows/build/badge.svg)

A [Range](https://jtalk.github.io/tree-range-set/classes/_range_.range.html) and 
[RangeSet](https://jtalk.github.io/tree-range-set/classes/_range_set_.rangeset.html) 
implementation based on search trees. 

This library is a replacement for array-based range/interval handling libraries [drange](https://www.npmjs.com/package/drange) 
and [range-set](https://www.npmjs.com/package/range-set) designed with performance on large sets in mind.
It offers better search complexity, `O(log(n))` vs `O(n)`, and a better average update performance, with the worst case 
scenario matching the former's `O(n)`, see [Performance](#performance). The performance improvements happen at a cost of higher memory consumption,
depending on an underlying search tree implementation.

This library's design was inspired by Guava's [RangeSet](https://guava.dev/releases/23.0/api/docs/com/google/common/collect/RangeSet.html).

## Installation

This library comes with Typescript typings built in, so you only need to include the package itself:

#### NPM
```bash
npm i tree-range-set
```

#### Yarn
```bash
yarn add tree-range-set
```

This library was built and tested with Node.js in mind, but there should be no reason for it not work in a modern browser.
That being said, handling large sets of ranges in a browser might be suboptimal, so you might want to look at 
[drange](https://www.npmjs.com/package/drange) for that instead.

If you're planning on using it with a custom type, implementing 
a [RangeSpec](https://jtalk.github.io/tree-range-set/interfaces/_range_spec_.rangespec.html) 
for your type might be required (see below for details).

## Usage cases

These are some of the basic use cases:

### Basic range arithmetics

```typescript
import { RangeSet, Range } from "tree-range-set";

// Create a range of natural numbers
const naturalRange = RangeSet.numeric().add(Range.closeOpen(1, Infinity));
naturalRange.contains(2); // yes, a natural number

// All the rational numbers?
const rationalRange = RangeSet.numeric().add(Range.open(-Infinity, Infinity));
naturalRange.contains(rationalRange); // false, but it works the other way around:
rationalRange.contains(naturalRange); // yes!

// What if we only want non-natural numbers?
const nonNaturalRange = rationalRange.subtract(naturalRange);
nonNaturalRange.contains(-1); // yes
nonNaturalRange.contains(1); // no, 1 is a natural number
```

### Using a custom value type for the range

```typescript
import { RangeSet, Range, AbstractRangeSpec, RangeSpec } from "tree-range-set";

class DateSpec extends AbstractRangeSpec<Date> implements RangeSpec<Date> {
  get comparator(): (a: Date, b: Date) => number {
    return (a, b) => a.getTime() - b.getTime();
  }
  // Infinity is optional, it provides special handling for closed ranges enclosed by infinity 
  isInfinity(value: Date): boolean {
    return false;
  }
}
// Instantiate the spec
const spec = new DateSpec();

const todayRange = Range.closeOpen(
                    new Date("2020-07-01T00:00:00Z"), 
                    new Date("2020-07-02T00:00:00Z"), 
                    spec);
const workingDaysRange = RangeSet.of(spec)
  .add(todayRange)
  .add(Range.closeOpen(
    new Date("2020-07-02T00:00:00Z"), new Date("2020-07-02T00:00:00Z"), spec)
  )
  .add(Range.closeOpen(
    new Date("2020-07-05T00:00:00Z"), new Date("2020-07-05T00:00:00Z"), spec)
  );


// Now we can query them:
todayRange.contains(new Date("2020-07-01T11:00:00Z")); // yes
workingDaysRange.contains(new Date("2020-07-01T11:00:00Z")); // yes, it's a working day

// We now can set up convenience functions to check dates based on our ranges:
const canScheduleMeeting = (desiredTime: Range<Date>) => workingDaysRange.contains(desiredTime);
canScheduleMeeting(
  Range.closeOpen(new Date("2020-07-02T12:00:00Z"), new Date("2020-07-02T13:00:00Z"), spec)
); // yes
canScheduleMeeting(
  Range.closeOpen(new Date("2020-07-04T12:00:00Z"), new Date("2020-07-04T13:00:00Z"), spec)
); // no, we don't work on the 4th.
```

### Using a custom tree implementation.

While it is possible to provide an alternative tree implementation, `bintrees` work fine, and this README is
too narrow to cover such an advanced topic. [This](https://jtalk.github.io/tree-range-set/modules/_range_set_tree_.html) 
should provide a good starting point for such a task.
  
## <a name="performance"></a> Performance

The below figures were measured by [Benchmark.js](https://benchmarkjs.com) 
with [this suite](https://github.com/Jtalk/tree-range-set/blob/master/src/range-set.perf.ts). 
I did my best to isolate potential bias, i.e. in creating relevant configs, but I'm open
to future suggestions on how to improve this benchmark. 

```
drange x 14.42 ops/sec ±2.31% (40 runs sampled)
range-set x 1.68 ops/sec ±17.26% (9 runs sampled)
tree-range-set x 67.37 ops/sec ±7.37% (58 runs sampled)
```

The numbers represent adding and subtracting around 8,000 ranges in a single set, in separate installments of 8 (add 4, subtract 4).
