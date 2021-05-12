import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface VotePostProps {
  post: PostSnippetFragment;
}

// Upvote and downvote buttons
export const VotePost: React.FC<VotePostProps> = ({ post }) => {
  // State for loading indicators on vote buttons
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();

  return (
    <>
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
    </>
  );
};
