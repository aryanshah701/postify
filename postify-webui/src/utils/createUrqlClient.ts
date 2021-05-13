import { dedupExchange, fetchExchange, gql, stringifyVariables } from "urql";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  LogoutMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
  CommentMutation,
  PostQuery,
  PostDocument,
  CommentMutationVariables,
  CommentFieldsFragment,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";
import { isServer } from "./isServer";
import { addNewCommentToCache } from "./addNewCommentToCache";

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

// Invalidate all pagianted posts(used when creating a post, logging in etc)
function invalidatePosts(cache: Cache): void {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");

  fieldInfos.forEach((fi) =>
    cache.invalidate("Query", "posts", fi.arguments || {})
  );
}

// A function that creates an urql client with an ssrExhange for
// server side rendering
export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie;

  // Grab the cookie from the context if on the nextjs server
  if (isServer() && ctx) {
    cookie = ctx.req.headers.cookie;
  }

  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? { cookie } : undefined,
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
            comment: (result, args, cache, _info) => {
              // Do nothing if the comment wasn't created successfully
              if (!result.comment) {
                return;
              }

              // Grab the cachedPost
              const { postId } = args as CommentMutationVariables;

              const cacheData = cache.readQuery({
                query: PostDocument,
                variables: {
                  id: postId,
                },
              }) as PostQuery;

              // Update the hcomments in the cached post
              const cachedHComments = cacheData.post?.hcomments;
              const rv = addNewCommentToCache(
                cachedHComments as any,
                result.comment as CommentFieldsFragment
              );

              // If the comment wasn't added, then invalidate the cache
              if (!rv) {
                // Doing nothing for now
                return;
              }

              // Write the updated hcomments to the cache
              cache.updateQuery(
                {
                  query: PostDocument,
                  variables: {
                    id: postId,
                  },
                },
                (queryData) => {
                  if (!queryData) {
                    return null;
                  }
                  (queryData!.post! as any).hcomments = cachedHComments;
                  return queryData;
                }
              );
            },
            deletePost: (_result, args, cache, _info) => {
              // Invalidate the deleted post
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_result, args, cache, _info) => {
              const { postId, value } = args as VoteMutationVariables;
              const cacheData = cache.readFragment(
                gql`
                  fragment _ on Post {
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              );

              if (cacheData) {
                let newPoints;

                // If the user has voted previously
                if (cacheData.voteStatus) {
                  // If there is no change, do nothing
                  if (cacheData.voteStatus === value) {
                    return;
                  }

                  newPoints = cacheData.points - cacheData.voteStatus + value;

                  // The user hasn't voted previously
                } else {
                  newPoints = cacheData.points + value;
                }

                // Write the new points and voteStatus to the cache
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value }
                );
              }
            },
            createPost: (_result, _args, cache, _info) => {
              // Invalidate all pages of posts stored in cache
              invalidatePosts(cache);
            },
            logout: (_result, _args, cache, _info) => {
              // Update me query in cache to be null now
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

              // Invalidate all posts in cache
              invalidatePosts(cache);
            },
            login: (_result, _args, cache, _info) => {
              // Update me query to have the new logged in user
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

              // Invalidate the posts in the cache
              invalidatePosts(cache);
            },
            register: (_result, _args, cache, _info) => {
              // Update me query to have the new logged in user
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

              // Invalidate the posts in the cache
              invalidatePosts(cache);
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
