import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import React from "react";
import { Layout } from "../components/Layout";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({ variables: { limit: 10 } });

  // Shouldn't ever come across this case
  if (!fetching && !data) {
    return <Box>Sorry, something went wrong on the server.</Box>;
  }

  return (
    <Layout>
      <Flex my={4} align="center">
        <Heading>Postify</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create Post</Link>
        </NextLink>
      </Flex>
      {data && !fetching ? (
        <Stack spacing={8}>
          {data.posts.map((post) => (
            <Box p={5} key={post.id} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text>{post.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      ) : null}
      {data ? (
        <Flex align="center" my={8}>
          <Button m="auto" isLoading={fetching}>
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
