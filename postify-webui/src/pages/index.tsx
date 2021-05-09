import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import React, { useState } from "react";
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
import { SinglePost } from "../components/SinglePost";

const Index = () => {
  const [paginationVars, setPaginationVars] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables: paginationVars });

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
          {data.posts.posts.map((post) =>
            post ? <SinglePost post={post} /> : null
          )}
        </Stack>
      ) : null}
      {data && data.posts.hasMore ? (
        <Flex align="center" my={8}>
          <Button
            onClick={() =>
              setPaginationVars({
                ...paginationVars,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            m="auto"
            isLoading={fetching}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Index);
