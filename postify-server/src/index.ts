// MikroORM imports
import { MikroORM } from "@mikro-orm/core";
import { CLIENT_URL, __prod__ } from "./constants";
import microOrmConfig from "./mikro-orm.config";

// Express, Apollo Server and GraphQL imports
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/posts";
import { UserResolver } from "./resolvers/users";
import express from "express";

// Redis and express session
import redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

import cors from "cors";

const main = async () => {
  // Init the ORM and run the migrations
  const orm = await MikroORM.init(microOrmConfig);
  await orm.getMigrator().up();

  // Conifgure Express
  const app = express();

  // Set up redis for express session in memory storage
  const RedisStore = connectRedis(session);
  const redisClient = new redis();

  // Apply the cors middleware to all routes
  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
    })
  );

  // Config and add express session with Redis store as a middleware
  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        secure: __prod__, // true in production
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: "skladjbsjhfajlf",
      resave: false,
    })
  );

  // Configure Apollo Server for GraphQL endpoint
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      em: orm.em,
      req,
      res,
      redis: redisClient,
    }),
  });

  // Add GraphQL endpoint
  apolloServer.applyMiddleware({ app, cors: false });

  // Spin up the express server
  app.listen(4000, () => console.log("Server listening at PORT 4000"));
};

main().catch((err) => {
  console.error(err);
});
