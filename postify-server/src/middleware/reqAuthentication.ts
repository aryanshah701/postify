import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const reqAuthentication: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  if (!context.req.session.userId) {
    throw new Error("You need to be logged in for this.");
  }

  return next();
};
