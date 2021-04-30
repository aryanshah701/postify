import { QueryInput, Cache } from "@urql/exchange-graphcache";

// The update query function on urql's cache instance with typescript types
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  console.log("In better upadte query");
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
