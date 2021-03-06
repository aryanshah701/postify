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
  GraphQLTimestamp,
} from "type-graphql";
import { ReqAuthentication } from "../middleware/reqAuthentication";
import {
  HierarchicalComment,
  MyContext,
  PostInput,
  PostsResponse,
  VoteResponse,
} from "../types";
import { getConnection } from "typeorm";
import { PAGINATION_MAX } from "../constants";
import { User } from "../entities/User";
import { Vote } from "../entities/Vote";
import { Comment } from "../entities/Comment";
import { arrangeCommentsHierarchically } from "../utils/arrangeCommentsHierarchically";

// Resolver for CRUD operations for Posts and associated relaitionships such as Votes, Comments
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

  // Load User from dataloader to load creator field onto posts
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext): Promise<User> {
    return userLoader.load(post.creatorId);
  }

  // Load comments for a post
  @FieldResolver(() => [HierarchicalComment])
  async hcomments(@Root() post: Post): Promise<HierarchicalComment[]> {
    // Grab all the comments associated to the post
    const comments = await Comment.find({
      where: { postId: post.id },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    // Arrange them in the heirarchial order
    const hComments = arrangeCommentsHierarchically(comments);

    return hComments;
  }
  // Load vote from dataloader for voteStatus field on posts
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { voteLoaderWithUserId, req }: MyContext
  ): Promise<number | null> {
    if (!req.session.userId) {
      return null;
    }

    const vote = await voteLoaderWithUserId.load({
      postId: post.id,
      userId: req.session.userId,
    });

    if (!vote) {
      return null;
    }

    return vote.value;
  }

  // Flat comment query not supported, one hierarchial query is through hcomments
  @FieldResolver(() => [Comment])
  comments(): Comment[] {
    return [];
  }

  // Create a comment for a post
  @Mutation(() => Comment, { nullable: true })
  @UseMiddleware(ReqAuthentication)
  async comment(
    @Arg("postId", () => Int) postId: number,
    @Arg("parentId", () => Int, { nullable: true })
    parentId: number,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | undefined | null> {
    // Ensure the parent comment id is valid
    let depth = 0;
    if (parentId) {
      const parentComment = await Comment.findOne({
        where: { postId, id: parentId },
      });

      // Invalid if parentComment doesn't exist or isn't from this post
      if (!parentComment || parentComment.postId !== postId) {
        return null;
      }

      depth = parentComment.depth + 1;
    }

    // Max depth of 30 for comments
    if (depth > 30) {
      return null;
    }

    // Insert the comment
    const userId = req.session.userId!;
    const comment = await Comment.create({
      postId,
      userId,
      parentId,
      text,
      depth,
    }).save();

    const commentWithRelations = await Comment.findOne(
      { id: comment.id, postId, userId },
      {
        relations: ["user"],
      }
    );

    return commentWithRelations;
  }

  // Edit an existing comment on a post
  @Mutation(() => Comment, { nullable: true })
  @UseMiddleware(ReqAuthentication)
  async updateComment(
    @Arg("id", () => Int) id: number,
    @Arg("postId", () => Int) _: number,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | null> {
    // Update the comment by commentId and userId so only users of comments
    // can update comments
    const userId = req.session.userId;
    const result = await getConnection()
      .createQueryBuilder()
      .update(Comment)
      .set({
        text,
      })
      .where("id = :id", { id })
      .andWhere("userId = :userId", { userId })
      .returning("*")
      .execute();

    return result.raw[0];
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
    @Arg("cursor", () => GraphQLTimestamp, { nullable: true }) cursor: number
  ): Promise<PostsResponse> {
    // Fetch one more than needed to see if there are any more posts
    // left in the db
    const myLimit = Math.min(PAGINATION_MAX, limit);
    const myLimitPlusOne = myLimit + 1;

    // Get limit posts ordered in descending order of createdAt col
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.votes", "votes")
      .leftJoinAndSelect("votes.user", "user")
      .take(myLimitPlusOne)
      .orderBy("post.createdAt", "DESC");

    // Start at cursor if given
    if (cursor) {
      qb.where('post."createdAt" < :cursor', {
        cursor: new Date(cursor),
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
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    // Grab the post
    const post = await Post.findOne(id, {
      relations: ["votes", "votes.user"],
    });

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
    @Arg("id", () => Int) id: number,
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
