import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microOrmConfig from "./mikro-orm.config";

const main = async () => {
  // Init the ORM and run the migrations
  const orm = await MikroORM.init(microOrmConfig);
  await orm.getMigrator().up();

  // Add some posts
  const postOne = orm.em.create(Post, { title: "My first post" });
  // const postTwo = orm.em.create(Post, { title: "My second post" });
  await orm.em.persistAndFlush(postOne);
  // await orm.em.persistAndFlush(postTwo);
};

main().catch((err) => {
  console.error(err);
});
