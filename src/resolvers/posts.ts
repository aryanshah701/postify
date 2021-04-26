import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Resolver, Query, Mutation, Ctx, Arg } from "type-graphql";

// Resolver for CRUD operations for Posts
@Resolver()
export class PostResolver {
  // Grab all the posts
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  // Grab a single post
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  // Create a single post
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const newPost = em.create(Post, { title });
    await em.persistAndFlush(newPost);
    return newPost;
  }

  // Update a single post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    // Find the post
    const postToUpdate = await em.findOne(Post, { id });

    // If the post is not found, return null
    if (!postToUpdate) {
      return null;
    }

    // If the title is provided, update the title
    if (title) {
      postToUpdate.title = title;
      await em.persistAndFlush(postToUpdate);
    }

    return postToUpdate;
  }

  // Delete a Post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    // Attempt to delete the post
    try {
      const delId = await em.nativeDelete(Post, { id });

      // If the post wasn't found and deleted
      if (delId === 0) {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }
}
