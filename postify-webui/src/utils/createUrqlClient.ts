import { dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
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

// Global URQL error handling exchange
export const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      // If the OperationResult has an error, handle it
      console.log(error);
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
      keys: { FieldError: () => null, UserResponse: () => null },
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
