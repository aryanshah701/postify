import argon2 from "argon2";
import { MyContext, UserInput, UserResponse } from "../types";
import { validateUser } from "../utils/validate";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/User";

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
    // Validate input
    const errors = validateUser(options);

    if (errors) {
      return {
        errors: errors,
      };
    }

    // Hash the password
    const hashedPassword = await argon2.hash(options.password);

    // Create the new user object
    const newUser = await em.create(User, {
      username: options.username,
      email: options.email,
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
        if (err.detail.includes("username")) {
          return {
            errors: [
              {
                field: "username",
                message: "Sorry, this username already exists!",
              },
            ],
          };
        }

        // Duplicate emails
        if (err.detail.includes("email")) {
          return {
            errors: [
              {
                field: "email",
                message: "Sorry, this email already exists!",
              },
            ],
          };
        }
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // Try and grab the user for the db by username
    let user = await em.findOne(User, { username: usernameOrEmail });

    // If failed try and grab by email
    if (!user) {
      user = await em.findOne(User, { email: usernameOrEmail });
    }

    // If the user still isn't found then doesn't exist
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Sorry, this email/username does not exist",
          },
        ],
      };
    }

    // Verify the provided password
    const verified = await argon2.verify(user.password, password);
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
