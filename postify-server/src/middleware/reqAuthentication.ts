import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const ReqAuthentication: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  if (!context.req.session.userId) {
    throw new Error("[Not authenticated] You need to be logged in for this.");
  }

  return next();
};
