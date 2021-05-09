import { Box, Heading, Spinner, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post: React.FC<{}> = ({}) => {
  // Grab the id from the query params
  const router = useRouter();
  const intId = parseInt(
    typeof router.query.id === "string" ? router.query.id : "-1"
  );

  // Grab the post
  const [{ data, fetching, error }] = usePostQuery({
    pause: intId === -1,
    variables: { id: intId },
  });

  // Show spinning icon if fetching
  if (fetching) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  // Display error message if err
  if (error) {
    console.log(error);
    return (
      <Layout>
        <Box>
          <Text>Sorry, something went wrong on the server.</Text>
        </Box>
      </Layout>
    );
  }

  // Handle not found post
  if (!data?.post) {
    return (
      <Layout>
        <Box>
          <Text>Sorry, can not find the requested post.</Text>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Heading my={4}>{data.post.title}</Heading>
        <Text>{data.post.text}</Text>
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Post);
