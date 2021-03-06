import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: any;
};

export type Comment = {
  __typename?: 'Comment';
  id: Scalars['Float'];
  postId: Scalars['Int'];
  userId: Scalars['Int'];
  user: User;
  parentId?: Maybe<Scalars['Int']>;
  text: Scalars['String'];
  depth: Scalars['Float'];
  createdAt: Scalars['Timestamp'];
  updatedAt: Scalars['String'];
};

export type FieldError = {
  __typename?: 'FieldError';
  field?: Maybe<Scalars['String']>;
  message: Scalars['String'];
};

export type HierarchicalComment = {
  __typename?: 'HierarchicalComment';
  id: Scalars['Int'];
  comment: Comment;
  children: Array<HierarchicalComment>;
};

export type Mutation = {
  __typename?: 'Mutation';
  comment?: Maybe<Comment>;
  updateComment?: Maybe<Comment>;
  vote: VoteResponse;
  createPost: Post;
  updatePost?: Maybe<Post>;
  deletePost: Scalars['Boolean'];
  register: UserResponse;
  login: UserResponse;
  logout: Scalars['Boolean'];
  forgotPassword: Scalars['Boolean'];
  changePassword: UserResponse;
};


export type MutationCommentArgs = {
  text: Scalars['String'];
  parentId?: Maybe<Scalars['Int']>;
  postId: Scalars['Int'];
};


export type MutationUpdateCommentArgs = {
  text: Scalars['String'];
  postId: Scalars['Int'];
  id: Scalars['Int'];
};


export type MutationVoteArgs = {
  value: Scalars['Int'];
  postId: Scalars['Int'];
};


export type MutationCreatePostArgs = {
  options: PostInput;
};


export type MutationUpdatePostArgs = {
  text: Scalars['String'];
  title: Scalars['String'];
  id: Scalars['Int'];
};


export type MutationDeletePostArgs = {
  id: Scalars['Int'];
};


export type MutationRegisterArgs = {
  options: UserInput;
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  usernameOrEmail: Scalars['String'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String'];
};


export type MutationChangePasswordArgs = {
  token: Scalars['String'];
  newPassword: Scalars['String'];
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['Float'];
  title: Scalars['String'];
  text: Scalars['String'];
  points: Scalars['Float'];
  creatorId: Scalars['Float'];
  creator: User;
  votes: Array<Vote>;
  comments: Array<Comment>;
  voteStatus?: Maybe<Scalars['Int']>;
  createdAt: Scalars['Timestamp'];
  updatedAt: Scalars['String'];
  textSnippet: Scalars['String'];
  hcomments: Array<HierarchicalComment>;
};

export type PostInput = {
  title: Scalars['String'];
  text: Scalars['String'];
};

export type PostsResponse = {
  __typename?: 'PostsResponse';
  posts: Array<Post>;
  hasMore: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String'];
  posts: PostsResponse;
  post?: Maybe<Post>;
  me: UserResponse;
};


export type QueryPostsArgs = {
  cursor?: Maybe<Scalars['Timestamp']>;
  limit: Scalars['Int'];
};


export type QueryPostArgs = {
  id: Scalars['Int'];
};


export type User = {
  __typename?: 'User';
  id: Scalars['Float'];
  username: Scalars['String'];
  email: Scalars['String'];
  votes: Vote;
  comments: Array<Comment>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type UserInput = {
  username: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type Vote = {
  __typename?: 'Vote';
  postId: Scalars['Int'];
  userId: Scalars['Int'];
  user: User;
  value: Scalars['Int'];
};

export type VoteResponse = {
  __typename?: 'VoteResponse';
  errors?: Maybe<Array<FieldError>>;
  isSuccessful: Scalars['Boolean'];
};

export type CommentFieldsFragment = (
  { __typename?: 'Comment' }
  & Pick<Comment, 'id' | 'parentId' | 'text' | 'depth' | 'createdAt'>
  & { user: (
    { __typename?: 'User' }
    & Pick<User, 'id' | 'username'>
  ) }
);

export type CommentsRecursiveFragment = (
  { __typename?: 'HierarchicalComment' }
  & { children: Array<(
    { __typename?: 'HierarchicalComment' }
    & { children: Array<(
      { __typename?: 'HierarchicalComment' }
      & { children: Array<(
        { __typename?: 'HierarchicalComment' }
        & { children: Array<(
          { __typename?: 'HierarchicalComment' }
          & { children: Array<(
            { __typename?: 'HierarchicalComment' }
            & { children: Array<(
              { __typename?: 'HierarchicalComment' }
              & { children: Array<(
                { __typename?: 'HierarchicalComment' }
                & { children: Array<(
                  { __typename?: 'HierarchicalComment' }
                  & { children: Array<(
                    { __typename?: 'HierarchicalComment' }
                    & { children: Array<(
                      { __typename?: 'HierarchicalComment' }
                      & { children: Array<(
                        { __typename?: 'HierarchicalComment' }
                        & { children: Array<(
                          { __typename?: 'HierarchicalComment' }
                          & { children: Array<(
                            { __typename?: 'HierarchicalComment' }
                            & { children: Array<(
                              { __typename?: 'HierarchicalComment' }
                              & { children: Array<(
                                { __typename?: 'HierarchicalComment' }
                                & { children: Array<(
                                  { __typename?: 'HierarchicalComment' }
                                  & { children: Array<(
                                    { __typename?: 'HierarchicalComment' }
                                    & { children: Array<(
                                      { __typename?: 'HierarchicalComment' }
                                      & { children: Array<(
                                        { __typename?: 'HierarchicalComment' }
                                        & { children: Array<(
                                          { __typename?: 'HierarchicalComment' }
                                          & HCommentFieldsFragment
                                        )> }
                                        & HCommentFieldsFragment
                                      )> }
                                      & HCommentFieldsFragment
                                    )> }
                                    & HCommentFieldsFragment
                                  )> }
                                  & HCommentFieldsFragment
                                )> }
                                & HCommentFieldsFragment
                              )> }
                              & HCommentFieldsFragment
                            )> }
                            & HCommentFieldsFragment
                          )> }
                          & HCommentFieldsFragment
                        )> }
                        & HCommentFieldsFragment
                      )> }
                      & HCommentFieldsFragment
                    )> }
                    & HCommentFieldsFragment
                  )> }
                  & HCommentFieldsFragment
                )> }
                & HCommentFieldsFragment
              )> }
              & HCommentFieldsFragment
            )> }
            & HCommentFieldsFragment
          )> }
          & HCommentFieldsFragment
        )> }
        & HCommentFieldsFragment
      )> }
      & HCommentFieldsFragment
    )> }
    & HCommentFieldsFragment
  )> }
  & HCommentFieldsFragment
);

export type HCommentFieldsFragment = (
  { __typename?: 'HierarchicalComment' }
  & Pick<HierarchicalComment, 'id'>
  & { comment: (
    { __typename?: 'Comment' }
    & CommentFieldsFragment
  ) }
);

export type PostSnippetFragment = (
  { __typename?: 'Post' }
  & Pick<Post, 'id' | 'title' | 'textSnippet' | 'points' | 'voteStatus' | 'createdAt'>
  & { creator: (
    { __typename?: 'User' }
    & Pick<User, 'id' | 'username'>
  ) }
);

export type RegularErrorFragment = (
  { __typename?: 'FieldError' }
  & Pick<FieldError, 'field' | 'message'>
);

export type RegularPostFragment = (
  { __typename?: 'Post' }
  & Pick<Post, 'id' | 'title' | 'text' | 'points' | 'voteStatus' | 'createdAt'>
  & { creator: (
    { __typename?: 'User' }
    & Pick<User, 'id' | 'username'>
  ), hcomments: Array<(
    { __typename?: 'HierarchicalComment' }
    & CommentsRecursiveFragment
  )> }
);

export type RegularUserFragment = (
  { __typename?: 'User' }
  & Pick<User, 'id' | 'username' | 'email'>
);

export type RegularUserResponseFragment = (
  { __typename?: 'UserResponse' }
  & { errors?: Maybe<Array<(
    { __typename?: 'FieldError' }
    & RegularErrorFragment
  )>>, user?: Maybe<(
    { __typename?: 'User' }
    & RegularUserFragment
  )> }
);

export type ChangePasswordMutationVariables = Exact<{
  newPassword: Scalars['String'];
  token: Scalars['String'];
}>;


export type ChangePasswordMutation = (
  { __typename?: 'Mutation' }
  & { changePassword: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type CommentMutationVariables = Exact<{
  postId: Scalars['Int'];
  parentId?: Maybe<Scalars['Int']>;
  text: Scalars['String'];
}>;


export type CommentMutation = (
  { __typename?: 'Mutation' }
  & { comment?: Maybe<(
    { __typename?: 'Comment' }
    & CommentFieldsFragment
  )> }
);

export type CreatePostMutationVariables = Exact<{
  options: PostInput;
}>;


export type CreatePostMutation = (
  { __typename?: 'Mutation' }
  & { createPost: (
    { __typename?: 'Post' }
    & Pick<Post, 'id' | 'title' | 'text' | 'points' | 'creatorId' | 'createdAt'>
  ) }
);

export type DeletePostMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeletePostMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deletePost'>
);

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ForgotPasswordMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'forgotPassword'>
);

export type LoginMutationVariables = Exact<{
  usernameOrEmail: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type RegisterMutationVariables = Exact<{
  username: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type UpdateCommentMutationVariables = Exact<{
  id: Scalars['Int'];
  postId: Scalars['Int'];
  text: Scalars['String'];
}>;


export type UpdateCommentMutation = (
  { __typename?: 'Mutation' }
  & { updateComment?: Maybe<(
    { __typename?: 'Comment' }
    & Pick<Comment, 'id' | 'text'>
  )> }
);

export type UpdatePostMutationVariables = Exact<{
  id: Scalars['Int'];
  title: Scalars['String'];
  text: Scalars['String'];
}>;


export type UpdatePostMutation = (
  { __typename?: 'Mutation' }
  & { updatePost?: Maybe<(
    { __typename?: 'Post' }
    & Pick<Post, 'id' | 'updatedAt' | 'title' | 'textSnippet' | 'text'>
  )> }
);

export type VoteMutationVariables = Exact<{
  postId: Scalars['Int'];
  value: Scalars['Int'];
}>;


export type VoteMutation = (
  { __typename?: 'Mutation' }
  & { vote: (
    { __typename?: 'VoteResponse' }
    & Pick<VoteResponse, 'isSuccessful'>
    & { errors?: Maybe<Array<(
      { __typename?: 'FieldError' }
      & Pick<FieldError, 'field' | 'message'>
    )>> }
  ) }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type PostQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type PostQuery = (
  { __typename?: 'Query' }
  & { post?: Maybe<(
    { __typename?: 'Post' }
    & Pick<Post, 'id' | 'title' | 'text' | 'points' | 'voteStatus' | 'createdAt'>
    & { creator: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'username'>
    ), hcomments: Array<(
      { __typename?: 'HierarchicalComment' }
      & CommentsRecursiveFragment
    )> }
  )> }
);

export type PostsQueryVariables = Exact<{
  limit: Scalars['Int'];
  cursor?: Maybe<Scalars['Timestamp']>;
}>;


export type PostsQuery = (
  { __typename?: 'Query' }
  & { posts: (
    { __typename?: 'PostsResponse' }
    & Pick<PostsResponse, 'hasMore'>
    & { posts: Array<(
      { __typename?: 'Post' }
      & PostSnippetFragment
    )> }
  ) }
);

export const PostSnippetFragmentDoc = gql`
    fragment PostSnippet on Post {
  id
  title
  textSnippet
  points
  voteStatus
  createdAt
  creator {
    id
    username
  }
}
    `;
export const CommentFieldsFragmentDoc = gql`
    fragment CommentFields on Comment {
  id
  parentId
  text
  depth
  createdAt
  user {
    id
    username
  }
}
    `;
export const HCommentFieldsFragmentDoc = gql`
    fragment HCommentFields on HierarchicalComment {
  id
  comment {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const CommentsRecursiveFragmentDoc = gql`
    fragment CommentsRecursive on HierarchicalComment {
  ...HCommentFields
  children {
    ...HCommentFields
    children {
      ...HCommentFields
      children {
        ...HCommentFields
        children {
          ...HCommentFields
          children {
            ...HCommentFields
            children {
              ...HCommentFields
              children {
                ...HCommentFields
                children {
                  ...HCommentFields
                  children {
                    ...HCommentFields
                    children {
                      ...HCommentFields
                      children {
                        ...HCommentFields
                        children {
                          ...HCommentFields
                          children {
                            ...HCommentFields
                            children {
                              ...HCommentFields
                              children {
                                ...HCommentFields
                                children {
                                  ...HCommentFields
                                  children {
                                    ...HCommentFields
                                    children {
                                      ...HCommentFields
                                      children {
                                        ...HCommentFields
                                        children {
                                          ...HCommentFields
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
    ${HCommentFieldsFragmentDoc}`;
export const RegularPostFragmentDoc = gql`
    fragment RegularPost on Post {
  id
  title
  text
  points
  voteStatus
  createdAt
  creator {
    id
    username
  }
  hcomments {
    ...CommentsRecursive
  }
}
    ${CommentsRecursiveFragmentDoc}`;
export const RegularErrorFragmentDoc = gql`
    fragment RegularError on FieldError {
  field
  message
}
    `;
export const RegularUserFragmentDoc = gql`
    fragment RegularUser on User {
  id
  username
  email
}
    `;
export const RegularUserResponseFragmentDoc = gql`
    fragment RegularUserResponse on UserResponse {
  errors {
    ...RegularError
  }
  user {
    ...RegularUser
  }
}
    ${RegularErrorFragmentDoc}
${RegularUserFragmentDoc}`;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($newPassword: String!, $token: String!) {
  changePassword(newPassword: $newPassword, token: $token) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useChangePasswordMutation() {
  return Urql.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument);
};
export const CommentDocument = gql`
    mutation Comment($postId: Int!, $parentId: Int, $text: String!) {
  comment(postId: $postId, parentId: $parentId, text: $text) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;

export function useCommentMutation() {
  return Urql.useMutation<CommentMutation, CommentMutationVariables>(CommentDocument);
};
export const CreatePostDocument = gql`
    mutation CreatePost($options: PostInput!) {
  createPost(options: $options) {
    id
    title
    text
    points
    creatorId
    createdAt
  }
}
    `;

export function useCreatePostMutation() {
  return Urql.useMutation<CreatePostMutation, CreatePostMutationVariables>(CreatePostDocument);
};
export const DeletePostDocument = gql`
    mutation DeletePost($id: Int!) {
  deletePost(id: $id)
}
    `;

export function useDeletePostMutation() {
  return Urql.useMutation<DeletePostMutation, DeletePostMutationVariables>(DeletePostDocument);
};
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `;

export function useForgotPasswordMutation() {
  return Urql.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument);
};
export const LoginDocument = gql`
    mutation Login($usernameOrEmail: String!, $password: String!) {
  login(usernameOrEmail: $usernameOrEmail, password: $password) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const RegisterDocument = gql`
    mutation Register($username: String!, $email: String!, $password: String!) {
  register(options: {username: $username, email: $email, password: $password}) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument);
};
export const UpdateCommentDocument = gql`
    mutation UpdateComment($id: Int!, $postId: Int!, $text: String!) {
  updateComment(id: $id, postId: $postId, text: $text) {
    id
    text
  }
}
    `;

export function useUpdateCommentMutation() {
  return Urql.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument);
};
export const UpdatePostDocument = gql`
    mutation UpdatePost($id: Int!, $title: String!, $text: String!) {
  updatePost(id: $id, title: $title, text: $text) {
    id
    updatedAt
    title
    textSnippet
    text
  }
}
    `;

export function useUpdatePostMutation() {
  return Urql.useMutation<UpdatePostMutation, UpdatePostMutationVariables>(UpdatePostDocument);
};
export const VoteDocument = gql`
    mutation Vote($postId: Int!, $value: Int!) {
  vote(postId: $postId, value: $value) {
    isSuccessful
    errors {
      field
      message
    }
  }
}
    `;

export function useVoteMutation() {
  return Urql.useMutation<VoteMutation, VoteMutationVariables>(VoteDocument);
};
export const MeDocument = gql`
    query Me {
  me {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useMeQuery(options: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
};
export const PostDocument = gql`
    query Post($id: Int!) {
  post(id: $id) {
    id
    title
    text
    points
    voteStatus
    createdAt
    creator {
      id
      username
    }
    hcomments {
      ...CommentsRecursive
    }
  }
}
    ${CommentsRecursiveFragmentDoc}`;

export function usePostQuery(options: Omit<Urql.UseQueryArgs<PostQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<PostQuery>({ query: PostDocument, ...options });
};
export const PostsDocument = gql`
    query Posts($limit: Int!, $cursor: Timestamp) {
  posts(limit: $limit, cursor: $cursor) {
    posts {
      ...PostSnippet
    }
    hasMore
  }
}
    ${PostSnippetFragmentDoc}`;

export function usePostsQuery(options: Omit<Urql.UseQueryArgs<PostsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<PostsQuery>({ query: PostsDocument, ...options });
};