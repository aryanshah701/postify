import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  EditIcon,
} from "@chakra-ui/icons";
import { Box, Flex, Heading, IconButton, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import React, { useState } from "react";
import {
  MeQuery,
  PostSnippetFragment,
  RegularUserResponseFragment,
  useDeletePostMutation,
  useVoteMutation,
} from "../generated/graphql";
import { PostMutationButtons } from "./PostMutationButtons";
import { VotePost } from "./VotePost";

interface SinglePostProps {
  post: PostSnippetFragment;
  me?: RegularUserResponseFragment;
}

// A single post card shown on the index page for each post
export const SinglePost: React.FC<SinglePostProps> = ({ post, me }) => {
  return (
    <Flex p={5} shadow="md" borderWidth="1px">
      <VotePost post={post} />
      <Flex flex={1}>
        <Box>
          <Flex mb={2}>
            <NextLink href="/post/[id]" as={`/post/${post.id}`}>
              <Link>
                <Heading mr={2} mb={2} fontSize="xl">
                  {post.title}
                </Heading>
              </Link>
            </NextLink>
            <Text as="cite">posted by {post.creator.username}</Text>
          </Flex>
          <Flex align="center">
            <Text>{post.textSnippet}</Text>
          </Flex>
        </Box>
        {post.creator.id === me?.user?.id ? (
          <Flex mt="auto" ml="auto">
            <PostMutationButtons
              postId={post.id}
              editHref="post/edit/[id]"
              editAs={`post/edit/${post.id}`}
            />
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
};
