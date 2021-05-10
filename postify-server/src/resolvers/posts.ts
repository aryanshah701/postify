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
  textSnippet(@Root() post: Post): String {
    if (post.text.length > 200) {
      return post.text.slice(0, 200) + " ...";
    } else {
      return post.text;
    }
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

        // Nothing needs to happen if the new vote and prev vote are the same
        if (prevVoteVal && realVal === prevVoteVal) {
          return { isSuccessful: true };
        }

        // Update the vote if a new different value vote is being made
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

    // Update the points on the post
    if (prevVoteVal) {
      // Opposite change in points(no value change in points handled above)
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
    @Arg("cursor", () => String, { nullable: true }) cursor: string,
    @Ctx() { req }: MyContext
  ): Promise<PostsResponse> {
    // Fetch one more than needed to see if there are any more posts
    // left in the db
    const myLimit = Math.min(PAGINATION_MAX, limit);
    const myLimitPlusOne = myLimit + 1;

    // Get limit posts ordered in descending order of createdAt col
    let userId = req.session.userId;
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

    // Add voteStatus on each post
    const postsToReturn = posts.slice(0, myLimit).map(
      (p): Post => {
        // Votestatus is null if the user isn't logged in
        if (!userId) {
          p.voteStatus = null;
          return p;
        }

        // Search for the user's vote
        const voteStatus = p.votes.find((v) => v.userId === userId)?.value;

        // Add the vote status field
        if (voteStatus) {
          p.voteStatus = voteStatus;
        } else {
          p.voteStatus = null;
        }
        return p;
      }
    );

    return {
      posts: postsToReturn,
      hasMore: posts.length === myLimitPlusOne,
    };
  }

  // Grab a single post
  @Query(() => Post, { nullable: true })
  async post(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Post | undefined> {
    // Grab the post
    const post = await Post.findOne(id, {
      relations: ["creator", "votes", "votes.user"],
    });

    // Add the voteStatus field if logged in
    const userId = req.session.userId;
    let voteStatus = null;
    if (userId) {
      voteStatus = post?.votes.find((v) => v.userId === userId)?.value;
      voteStatus = voteStatus ? voteStatus : null;
    }

    if (post) {
      post.voteStatus = voteStatus;
    }

    return post;
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
  @UseMiddleware(ReqAuthentication)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ text, title })
      .where("id = :id", { id })
      .andWhere('"creatorId" = :creatorId', { creatorId: req.session.userId })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  // Delete a Post
  @Mutation(() => Boolean)
  @UseMiddleware(ReqAuthentication)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // Ensure the post exists
    const post = await Post.findOne(id);
    if (!post) {
      return false;
    }

    // Ensure the user is autherized to delete this post
    if (post.creatorId !== req.session.userId) {
      throw new Error(
        "Not authorized: You need to be the owner of this post to delete it."
      );
    }

    // Delete it
    await Post.delete(id);

    return true;
  }
}
