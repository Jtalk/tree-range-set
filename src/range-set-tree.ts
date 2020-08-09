/**
 * A set of interfaces for plugging in alternative search tree implementations.
 *
 * @packageDocumentation
 */

/**
 * A standard node data comparator.
 *
 * @typeParam T The type of the values to compare.
 * @returns 0 if two nodes are equal, negative if a < b, and positive otherwise.
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * A plug-in interface for custom tree implementations.
 *
 * @typeParam T The type this tree holds.
 *              It must be opaque for the actual tree implementation.
 */
export interface RangeSetTree<T> {
  size: number;
  insert(item: T): void;
  remove(item: T): void;
  clear(): void;

  /**
   * Return the node equal or immediately after `item`.
   *
   * Examples:
   * - `Tree([1, 3, 5]).lowerBound(3) -> 3`
   * - `Tree([1, 3, 5]).lowerBound(4) -> 5`
   *
   * @param item The value to search by.
   * @returns An iterator with `data` pointing at the desired node, an empty iterator otherwise (see [[`TreeIterator`]]).
   */
  lowerBound(item: T): TreeIterator<T>;

  /**
   * Return the node immediately after `item`.
   *
   * Examples:
   * - `Tree([1, 3, 5]).upperBound(3) -> 5`
   * - `Tree([1, 3, 5]).upperBound(4) -> 5`
   *
   * @param item The value to search by.
   * @returns An iterator with `data` pointing at the desired node, an empty iterator otherwise (see [[`TreeIterator`]]).
   */
  upperBound(item: T): TreeIterator<T>;

  /**
   * An iterator through the tree, conforming to [[`TreeIterator`]]'s requirements.
   *
   * This method should return an **empty iterator**, i.e. one pointing before the
   * lowest item in the tree.
   *
   * Examples:
   * ```typescript
   * // Initially an empty iterator:
   * const iterator = Tree([1, 2, 3]).iterator();
   * iterator.data === null; // -> true
   *
   * // Now, moving down one element, cycling the tree around:
   * iterator.prev() === 3; // -> true
   *
   * // Now, if we check the data again:
   * iterator.data === 3; // -> true
   * ```
   */
  iterator(): TreeIterator<T>;
}

/**
 * An iterator interface for [[`RangeSetTree`]].
 *
 * This interface is expected to be an ascending iterator, i.e. iterating from the lowest element in the set
 * to the highest. Therefore, [[`TreeIterator.prev`]] is expected to switch it to the **lower element in the tree**
 * upon each invocation.
 *
 * An empty iterator is represented by [[`TreeIterator.data`]] being `null`. Calling [[`TreeIterator.prev`]] on
 * an empty iterator **should re-point it at the highest value in the tree**, returning that value.
 *
 * @typeParam T The type this tree holds.
 *              It must be opaque for the actual iterator implementation.
 */
export interface TreeIterator<T> {
  /**
   * Move [[`TreeIterator.data`]] to the next lower element in this tree,
   * returning said element.
   *
   * It should return `null` for the lowest element in the tree in the order
   * of iteration, and then the highest element on the next invocation.
   */
  prev(): T | null;

  /**
   * The data of the node this iterator is pointing at.
   *
   * Returns `null` for an empty iterator, i.e. one pointing before the lowest
   * item of the tree, returned by either [[`RangeSetTree.iterator`]], or one
   * of the bound finder methods, e.g. [[`RangeSetTree.lowerBound`]].
   */
  data: T | null;
}
