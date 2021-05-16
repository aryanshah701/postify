import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { HComments } from "../../components/HComments";
import { Layout } from "../../components/Layout";
import { PostMutationButtons } from "../../components/PostMutationButtons";
import { VotePost } from "../../components/VotePost";
import {
  useCommentMutation,
  useMeQuery,
  usePostQuery,
} from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post: React.FC<{}> = ({}) => {
  const [newComment, setNewComment] = useState("");
  const [{ fetching: postingComment }, createComment] = useCommentMutation();

  // Grab the id from the query params
  const router = useRouter();
  const intId = parseInt(
    typeof router.query.id === "string" ? router.query.id : "-1"
  );
  const [{ data: meData }] = useMeQuery();

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
      <Flex mb={8} mx={0}>
        <VotePost post={data.post as any} />
        <Box flex={1} pb={4} ml={4} borderBottom="1px" borderColor="gray.200">
          <Box mb={4}>
            <Heading my={4}>{data.post.title}</Heading>
            <Text>{data.post.text}</Text>
          </Box>
          <Flex mb={4}>
            {data.post.creator.id === meData?.me.user?.id ? (
              <PostMutationButtons
                postId={data.post.id}
                onDeletePost={() => router.push("/")}
                editHref="edit/[id]"
                editAs={`edit/${data.post.id}`}
              />
            ) : null}
          </Flex>
          <Box>
            <Textarea
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              size="sm"
              colorScheme="teal"
              isLoading={postingComment}
              onClick={async () => {
                // Post a comment with no parent
                await createComment({
                  postId: data.post!.id,
                  text: newComment,
                });

                // Clear the comment
                setNewComment("");
              }}
            >
              Comment
            </Button>
          </Box>
        </Box>
      </Flex>
      <Box>
        <HComments hcomments={data.post.hcomments} post={data.post} />
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
