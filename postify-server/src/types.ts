import { Request, Response } from "express";
import { InputType, Field, ObjectType } from "type-graphql";
import { User } from "./entities/User";
import { Redis } from "ioredis";
import { Post } from "./entities/Post";

// Context object for resovlers
export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
};

// Declaration merging to add fields onto express session object
declare module "express-session" {
  export interface SessionData {
    userId: number;
  }
}

// Input type for creating/loging a user
@InputType()
export class UserInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}

// Input type for creating a post
@InputType()
export class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

// An error object for field errors
@ObjectType()
export class FieldError {
  @Field(() => String, { nullable: true })
  field?: string;
  @Field()
  message: string;
}

// A response obeject with any errors or the user itself
@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

// The response object for the posts query
@ObjectType()
export class PostsResponse {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

// The response object when voting on a post
@ObjectType()
export class VoteResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field()
  isSuccessful: Boolean;
}
