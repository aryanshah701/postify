import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
  ObjectType,
  Resolver,
  Mutation,
  Query,
  InputType,
  Field,
  Arg,
  Ctx,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";

// Input type for creating/loging a user
@InputType()
class UserInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

// An error object for field errors
@ObjectType()
class FieldError {
  @Field(() => String, { nullable: true })
  field?: string;
  @Field()
  message: string;
}

// A response obeject with any errors or the user itself
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

// The resolver class for CRUD operations on Users
@Resolver()
export class UserResolver {
  // Grab and show the authenticated user
  @Query(() => UserResponse)
  async me(@Ctx() { em, req }: MyContext): Promise<UserResponse> {
    // Check if authenticated
    if (!req.session.userId) {
      return { errors: [{ message: "Sorry, you aren't logged in." }] };
    }

    // Grab the user and return it
    const user = await em.findOne(User, { id: req.session.userId });

    if (!user) {
      return {
        errors: [
          {
            message:
              "Sorry, the user you are logged in as doesn't exist anymore.",
          },
        ],
      };
    }

    return { user };
  }
  // Create a User
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // Validate username and password
    if (options.username.length < 3) {
      return {
        errors: [
          {
            field: "username",
            message: "Sorry, the username needs to be > 2 characters.",
          },
        ],
      };
    }

    if (options.password.length < 8) {
      return {
        errors: [
          {
            field: "password",
            message: "Sorry, the password needs to be > 7 characters.",
          },
        ],
      };
    }

    // Hash the password
    const hashedPassword = await argon2.hash(options.password);

    // Create the new user object
    const newUser = await em.create(User, {
      username: options.username,
      password: hashedPassword,
    });

    // Persist to the database if possible
    try {
      await em.persistAndFlush(newUser);
    } catch (err) {
      console.error(err);
      // Handle different error cases
      if (err.code === "23505") {
        // Duplicate usernames
        return {
          errors: [
            {
              field: "username",
              message: "Sorry, this username already exists!",
            },
          ],
        };
      } else {
        // Generic case
        return {
          errors: [{ message: err.detail }],
        };
      }
    }

    // Create a session and save the user id in the session
    req.session.userId = newUser.id;

    return {
      user: newUser,
    };
  }

  // Logging in a user
  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UserInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // Grab the user fro the db
    const user = await em.findOne(User, { username: options.username });

    // Ensure that the user exists in the db
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Sorry, this username does not exists",
          },
        ],
      };
    }

    // Verify the provided password
    const verified = await argon2.verify(user.password, options.password);
    if (!verified) {
      return {
        errors: [
          {
            field: "password",
            message: "Sorry, the provided password is invalid",
          },
        ],
      };
    }

    // Create a session and save the user id in the session
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    // Destroy the session and clear the cookie
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
        }

        resolve(true);
      });
    });
  }
}
