import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import React from "react";

export const SinglePost: React.FC<{ post: any }> = ({ post }) => {
  return (
    <Box p={5} key={post.id} shadow="md" borderWidth="1px">
      <Flex>
        <Heading mr={2} fontSize="xl">
          {post.title}
        </Heading>
        <Text as="cite">posted by {post.creator.username}</Text>
      </Flex>
      <Text isTruncated>{post.textSnippet}</Text>
    </Box>
  );
};
