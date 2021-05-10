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

interface SinglePostProps {
  post: PostSnippetFragment;
  me?: RegularUserResponseFragment;
}

export const SinglePost: React.FC<SinglePostProps> = ({ post, me }) => {
  // State for loading indicators on vote buttons
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  const [, deletePost] = useDeletePostMutation();

  return (
    <Flex p={5} shadow="md" borderWidth="1px">
      <Flex direction="column" alignItems="center" mr={4}>
        <IconButton
          onClick={async () => {
            setLoadingState("upvote-loading");
            await vote({ postId: post.id, value: 1 });
            setLoadingState("not-loading");
          }}
          isLoading={loadingState === "upvote-loading"}
          aria-label="upvote the post"
          icon={<ChevronUpIcon />}
          colorScheme={post.voteStatus === 1 ? "green" : undefined}
        />
        <Text my={2}>{post.points}</Text>
        <IconButton
          onClick={async () => {
            setLoadingState("downvote-loading");
            await vote({ postId: post.id, value: -1 });
            setLoadingState("not-loading");
          }}
          isLoading={loadingState === "downvote-loading"}
          aria-label="downvote the post"
          icon={<ChevronDownIcon />}
          colorScheme={post.voteStatus === -1 ? "red" : undefined}
        />
      </Flex>
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
            <NextLink href="post/edit/[id]" as={`post/edit/${post.id}`}>
              <IconButton
                icon={<EditIcon />}
                as={Link}
                variant="outline"
                aria-label="Edit post"
                colorScheme="yellow"
                mr={2}
              />
            </NextLink>
            <IconButton
              icon={<DeleteIcon />}
              variant="outline"
              aria-label="Delete post"
              colorScheme="red"
              onClick={() => {
                deletePost({ id: post.id });
              }}
            />
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
};
