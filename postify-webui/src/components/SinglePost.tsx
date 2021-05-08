import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface SinglePostProps {
  post: PostSnippetFragment;
}

export const SinglePost: React.FC<SinglePostProps> = ({ post }) => {
  // State for loading indicators on vote buttons
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();

  return (
    <Flex p={5} key={post.id} shadow="md" borderWidth="1px">
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
      <Box>
        <Flex>
          <Heading mr={2} mb={2} fontSize="xl">
            {post.title}
          </Heading>
          <Text as="cite">posted by {post.creator.username}</Text>
        </Flex>
        <Text>{post.textSnippet}</Text>
      </Box>
    </Flex>
  );
};
