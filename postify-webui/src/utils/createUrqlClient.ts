import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { cacheExchange, NullArray, Resolver } from "@urql/exchange-graphcache";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  LogoutMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";

// Cursor pagination exchange
const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    // Grab all the queries with the given fieldName
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    // Query server if query doesn't already exist in cache
    const currQueryFieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const currQueryInCache = cache.resolve(
      cache.resolve(entityKey, currQueryFieldKey) as string,
      "posts"
    ) as string[];
    info.partial = !currQueryInCache;

    // Combine all the posts from the queries
    const posts: string[] = [];
    let hasMore = true;
    fieldInfos.forEach((fi) => {
      // Grab the posts from this query
      const currPosts = cache.resolve(
        cache.resolve(entityKey, fi.fieldKey) as string,
        "posts"
      ) as string[];
      posts.push(...currPosts);

      // Grab hasMore field from this query
      const currHasMore = cache.resolve(
        cache.resolve(entityKey, fi.fieldKey) as string,
        "hasMore"
      ) as boolean;
      hasMore = hasMore && currHasMore;
    });

    return {
      __typename: "PostsResponse",
      posts,
      hasMore,
    };
  };
};

// Global URQL error handling exchange
export const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      // If the OperationResult has an error, handle it
      if (error?.message.includes("Not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

// A function that creates an urql client with an ssrExhange for
// server side rendering
export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PostsResponse: () => null,
        FieldError: () => null,
        UserResponse: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          logout(_result, _args, cache, _info) {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => {
                return {
                  me: {
                    user: null,
                    errors: null,
                    __typename: "UserResponse",
                  },
                };
              }
            );
          },
          login(_result, _args, cache, _info) {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                }

                return {
                  me: {
                    user: result.login.user,
                    __typename: "UserResponse",
                    errors: null,
                  },
                };
              }
            );
          },
          register(_result, _args, cache, _info) {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                }

                return {
                  me: {
                    user: result.register.user,
                    __typename: "UserResponse",
                    errors: null,
                  },
                };
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
