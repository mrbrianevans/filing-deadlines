/**
 * Counts the occurrances of each value in an array.
 * @param values - an array of values.
 * @example [1,1,1,2] => { 1: 3, 2: 1 }
 * @returns an object of { value: count }
 */
export function countOccurrances<T extends string|number>(values: T[]): Record<T, number>{
  const counts = <Record<T, number>>{}
  for (const value of values) {
    if(value in counts) counts[value]++
    else counts[value] = 1
  }
  return counts
}
