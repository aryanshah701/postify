import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  UseMiddleware,
  Ctx,
  Int,
  FieldResolver,
  Root,
} from "type-graphql";
import { ReqAuthentication } from "../middleware/reqAuthentication";
import { MyContext, PostInput, PostsResponse } from "../types";
import { getConnection } from "typeorm";
import { PAGINATION_MAX } from "../constants";
import { User } from "../entities/User";
import { Vote } from "../entities/Vote";
import { createVoidZero } from "typescript";

// Resolver for CRUD operations for Posts
@Resolver(Post)
export class PostResolver {
  // Provide a text snippet field
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 100) + " ...";
  }

  // Upvote or downvote the post
  @Mutation(() => Boolean)
  @UseMiddleware(ReqAuthentication)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // Only upvote or downvote by 1
    const realVal = value === -1 ? -1 : 1;

    // Insert the vote
    Vote.insert({
      userId: req.session.userId,
      postId,
      value: realVal,
    });

    // Update the points for the post
    try {
      await getConnection()
        .createQueryBuilder()
        .update(Post)
        .set({
          points: () => "points + 1",
        })
        .where("id = :id", { id: postId })
        .execute();
    } catch (err) {
      return false;
    }

    return true;
  }

  // Grab all the posts
  @Query(() => PostsResponse)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string
  ): Promise<PostsResponse> {
    // Fetch one more than needed to see if there are any more posts
    // left in the db
    const myLimit = Math.min(PAGINATION_MAX, limit);
    const myLimitPlusOne = myLimit + 1;

    // Get limit posts ordered in descending order of createdAt col
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.creator", "creator")
      .leftJoinAndSelect("post.votes", "votes")
      .leftJoinAndSelect("votes.user", "user")
      .take(myLimitPlusOne)
      .orderBy("post.createdAt", "DESC");

    // Start at cursor if given
    if (cursor) {
      qb.where('post."createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await qb.getMany();
    return {
      posts: posts.slice(0, myLimit),
      hasMore: posts.length === myLimitPlusOne,
    };
  }

  // Grab a single post
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ["creator", "votes", "votes.user"] });
  }

  // Create a single post
  @Mutation(() => Post)
  @UseMiddleware(ReqAuthentication)
  async createPost(
    @Arg("options") options: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const creator = await User.findOne(req.session.userId);
    return Post.create({
      title: options.title,
      text: options.text,
      creator,
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
