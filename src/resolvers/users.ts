import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Mutation, InputType, Field, Arg, Ctx } from "type-graphql";
import argon2 from "argon2";

// Input type for creating/loging a user
@InputType()
class UserInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User, { nullable: true })
  async register(
    @Arg("options") options: UserInput,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
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
      return null;
    }

    return newUser;
  }
}
