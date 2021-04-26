// MikroORM imports
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microOrmConfig from "./mikro-orm.config";

// Apollo and GraphQL imports
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/posts";

import express from "express";
import "reflect-metadata";
import { UserResolver } from "./resolvers/users";

const main = async () => {
  // Init the ORM and run the migrations
  const orm = await MikroORM.init(microOrmConfig);
  await orm.getMigrator().up();

  // Conifgure Express
  const app = express();

  // Configure Apollo Server for GraphQL endpoint
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  // Add GraphQL endpoint
  apolloServer.applyMiddleware({ app });

  // Spin up the express server
  app.listen(4000, () => console.log("Server listening at PORT 4000"));
};

main().catch((err) => {
  console.error(err);
});
