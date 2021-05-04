import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  UseMiddleware,
  Ctx,
  Int,
} from "type-graphql";
import { ReqAuthentication } from "../middleware/reqAuthentication";
import { MyContext, PostInput } from "../types";
import { getConnection } from "typeorm";
import { PAGINATION_MAX } from "../constants";

// Resolver for CRUD operations for Posts
@Resolver()
export class PostResolver {
  // Grab all the posts
  @Query(() => [Post])
  posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string
  ): Promise<Post[]> {
    const myLimit = Math.min(PAGINATION_MAX, limit);

    // Get limit posts ordered in descending order of createdAt col
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .take(myLimit)
      .orderBy('"createdAt"', "DESC");

    // Start at cursor if given
    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    }

    return qb.getMany();
  }

  // Grab a single post
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // Create a single post
  @Mutation(() => Post)
  @UseMiddleware(ReqAuthentication)
  async createPost(
    @Arg("options") options: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      title: options.title,
      text: options.text,
      creatorId: req.session.userId,
    }).save();
  }

  // Update a single post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    // Find the post
    const postToUpdate = await Post.findOne(id);

    // If the post is not found, return null
    if (!postToUpdate) {
      return null;
    }

    // If the title is provided, update the title
    if (title) {
      postToUpdate.title = title;
      await Post.update({ id }, { title });
    }

    return postToUpdate;
  }

  // Delete a Post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
