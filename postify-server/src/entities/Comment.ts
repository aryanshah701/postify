import { ObjectType, Field, Int } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// Join table for votes on a post
@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn()
  postId!: number;

  @ManyToOne(() => Post, (post) => post.votes, {
    onDelete: "CASCADE",
  })
  post: Post;

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.votes)
  user: User;

  @Field(() => Comment)
  @Column({ type: "text", nullable: true })
  parentId: Comment;

  @Field()
  @Column()
  text: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
