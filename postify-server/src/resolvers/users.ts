import "dotenv-safe/config";
import argon2 from "argon2";
import { MyContext, UserInput, UserResponse } from "../types";
import { isValidPassword, validateUser } from "../utils/validate";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { COOKIE_NAME, REDIS_CHANGE_PASS_PREFIX } from "../constants";
import { User } from "../entities/User";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

// The resolver class for CRUD operations on Users
@Resolver(User)
export class UserResolver {
  // Only expose the email if the user is authorized to do so
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext): String {
    if (req.session.userId === user.id) {
      return user.email;
    }
    return "";
  }

  // Grab and show the authenticated user
  @Query(() => UserResponse)
  async me(@Ctx() { req }: MyContext): Promise<UserResponse> {
    // Check if authenticated
    if (!req.session.userId) {
      return { errors: [{ message: "Sorry, you aren't logged in." }] };
    }

    // Grab the user and return it
    const user = await User.findOne(req.session.userId);

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
    @Ctx() { req }: MyContext
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

    // Create and persist to the database if possible
    let newUser;
    try {
      newUser = await User.create({
        username: options.username,
        email: options.email,
        password: hashedPassword,
      }).save();
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

    // If for some reason the user is undefined
    if (!newUser) {
      return {
        errors: [
          {
            message: "Something went wrong when registering.",
          },
        ],
      };
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // Try and grab the user for the db by username
    let user = await User.findOne({ where: { username: usernameOrEmail } });

    // If failed try and grab by email
    if (!user) {
      user = await User.findOne({ where: { email: usernameOrEmail } });
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

  // Logout a user by destroying the session
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

  // Forgot password: Store a unique token for the user in redis, and
  // send an email with a link to the change password page with the token
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // User doesn't exist in the db
      return true;
    }

    // Create uuid token for the user and store in redis
    const token = v4();
    redis.set(
      `${REDIS_CHANGE_PASS_PREFIX}${token}`,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 // 1 day expiry
    );

    // Send forgot password email with token
    const forgotPasswordEmailHtml = `<a href="${process.env.CLIENT}/change-password/${token}">Click here to change your password</a>`;

    await sendEmail(email, forgotPasswordEmailHtml);

    return true;
  }

  // Change password: Change the user's password on the db after verifying the user token
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    // Verify the token
    const redisKey = `${REDIS_CHANGE_PASS_PREFIX}${token}`;
    const userIdInRedis = await redis.get(redisKey);

    if (!userIdInRedis) {
      return {
        errors: [
          {
            field: "token",
            message: "Your token is no longer valid.",
          },
        ],
      };
    }

    // Get the user from the db
    const userId = parseInt(userIdInRedis);
    const user = await User.findOne(userId);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "Sorry, the user no longer exists.",
          },
        ],
      };
    }

    // Validate password
    if (!isValidPassword(newPassword)) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "The password needs to be > 7 characters.",
          },
        ],
      };
    }

    // Change the user's password
    const newHashedPassword = await argon2.hash(newPassword);
    user.password = newHashedPassword;
    User.update({ id: userId }, { password: newHashedPassword });

    // Sign the user in autmatically
    req.session.userId = user.id;

    // Destroy redis entry
    redis.del(redisKey);

    return {
      user,
    };
  }
}
