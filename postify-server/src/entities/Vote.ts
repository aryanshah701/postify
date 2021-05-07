import { ObjectType, Field, Int } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// Join table for votes on a post
@ObjectType()
@Entity()
export class Vote extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn()
  postId!: number;

  @ManyToOne(() => Post, (post) => post.votes)
  post: Post;

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.votes)
  user: User;

  @Field(() => Int)
  @Column()
  value!: number;
}
