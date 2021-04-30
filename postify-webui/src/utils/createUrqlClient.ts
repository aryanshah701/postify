import { createClient, dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

// A function that creates an urql client with an ssrExhange for
// server side rendering
export const createUrqlClient = (ssrExchange: any) =>
  createClient({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: { UserResponse: () => null },
        updates: {
          Mutation: {
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
                    },
                  };
                }
              );
            },
          },
        },
      }),
      ssrExchange,
      fetchExchange,
    ],
  });
