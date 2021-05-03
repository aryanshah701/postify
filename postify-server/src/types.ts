import { Request, Response } from "express";
import { InputType, Field, ObjectType } from "type-graphql";
import { User } from "./entities/User";
import { Redis } from "ioredis";

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
