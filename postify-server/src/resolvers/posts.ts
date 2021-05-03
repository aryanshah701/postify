import { Post } from "../entities/Post";
import { Resolver, Query, Mutation, Arg } from "type-graphql";

// Resolver for CRUD operations for Posts
@Resolver()
export class PostResolver {
  // Grab all the posts
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find({});
  }

  // Grab a single post
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // Create a single post
  @Mutation(() => Post)
  async createPost(@Arg("title") title: string): Promise<Post> {
    return Post.create({ title }).save();
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
