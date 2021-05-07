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
import { MyContext, PostInput, PostsResponse, VoteResponse } from "../types";
import { getConnection } from "typeorm";
import { PAGINATION_MAX } from "../constants";
import { User } from "../entities/User";
import { Vote } from "../entities/Vote";

// Resolver for CRUD operations for Posts
@Resolver(Post)
export class PostResolver {
  // Provide a text snippet field
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 100) + " ...";
  }

  // Upvote or downvote the post
  @Mutation(() => VoteResponse)
  @UseMiddleware(ReqAuthentication)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<VoteResponse> {
    // Only upvote or downvote by 1
    const realVal = value === -1 ? -1 : 1;
    const userId = req.session.userId;
    let prevVoteVal;

    // Ensure the provided postId is valid
    const post = await Post.findOne(postId);
    if (!post) {
      return {
        errors: [{ field: "postId", message: "This post is no longer valid." }],
        isSuccessful: false,
      };
    }

    try {
      // Insert the vote
      await Vote.insert({
        userId,
        postId,
        value: realVal,
      });

      // Handle any errors
    } catch (err) {
      // Same user voting on the same post
      if (err.code === "23505") {
        // Get the previous vote to save it's value
        const vote = await Vote.findOne({
          where: { userId: userId, postId: postId },
        });
        prevVoteVal = vote?.value;

        // Update the vote
        await getConnection()
          .createQueryBuilder()
          .update(Vote)
          .set({ value: realVal })
          .where("userId = :userId", { userId })
          .andWhere("postId = :postId", { postId })
          .execute();

        // Some other unknown error
      } else {
        return {
          errors: [
            {
              field: "vote",
              message: "Something went wrong with inserting the new vote.",
            },
          ],
          isSuccessful: false,
        };
      }
    }

    // Update the points of the post
    if (prevVoteVal && prevVoteVal === realVal) {
      // No change in points so do nothing
      return { isSuccessful: true };
    } else if (prevVoteVal) {
      // Opposite change in points
      Post.update(
        { id: postId },
        { points: post.points - prevVoteVal + realVal }
      );
    } else {
      // User is voting on this post for the first time
      Post.update({ id: postId }, { points: post.points + realVal });
    }

    return { isSuccessful: true };
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
