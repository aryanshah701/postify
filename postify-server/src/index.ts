import "dotenv-safe/config";

// ORM and db imports
import "reflect-metadata";
import { createConnection } from "typeorm";
import { __prod__ } from "./constants";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { Vote } from "./entities/Vote";
import { Comment } from "./entities/Comment";
import { createUserLoader } from "./utils/createUserLoader";
import { createVoteLoaderWithUserId } from "./utils/createVoteLoaderWithUserId";

// Express, Apollo Server and GraphQL imports
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
import path from "path";

const main = async () => {
  // Init the ORM connection(auto run migrations)
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    synchronize: true,
    entities: [Post, User, Vote, Comment],
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  await conn.runMigrations();
  // await Post.delete({});
  // await Comment.delete({});

  // Conifgure Express
  const app = express();

  // Set up redis for express session in memory storage
  const RedisStore = connectRedis(session);
  const redisClient = new redis(process.env.REDIS_URL);

  // Nginx proxy
  app.set("trust proxy", 1);

  // Apply the cors middleware to all routes
  app.use(
    cors({
      origin: process.env.CLIENT,
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
        sameSite: "lax",
        secure: __prod__, // true in production
        domain: __prod__ ? ".aryanshah.tech" : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SECRET,
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
      req,
      res,
      redis: redisClient,
      userLoader: createUserLoader(),
      voteLoaderWithUserId: createVoteLoaderWithUserId(),
    }),
  });

  // Add GraphQL endpoint
  apolloServer.applyMiddleware({ app, cors: false });

  // Spin up the express server
  app.listen(parseInt(process.env.PORT), () =>
    console.log("Server listening at PORT 4000")
  );
};

main().catch((err) => {
  console.error(err);
});
