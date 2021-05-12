import React, { useState } from "react";
import {
  CommentFieldsFragment,
  RegularPostFragment,
  useCommentMutation,
  useMeQuery,
} from "../generated/graphql";
import {
  Input,
  Box,
  Button,
  ChakraProps,
  Flex,
  Heading,
  Text,
  Textarea,
} from "@chakra-ui/react";

interface CommentProps extends ChakraProps {
  comment: CommentFieldsFragment;
  post: RegularPostFragment;
}

// A single Comment in a Hierarical comment structure
export const Comment: React.FC<CommentProps> = ({
  comment,
  post,
  ...props
}) => {
  const [{ data: meData }] = useMeQuery();

  // State for reply and edit forms
  const [reply, setReply] = useState("");
  const [edit, setEdit] = useState("");
  const [showForm, setShowForm] = useState<"none" | "edit" | "reply">("none");

  // To submit a reply or edit this comment
  const [{ fetching }, submitReply] = useCommentMutation();

  return (
    <Box my={2}>
      <Box mb={2}>
        <Heading mb={1} as="h4" size="sm">
          {comment.user.username}
        </Heading>
        <Text lineHeight={1.2} {...props}>
          {comment.text}
        </Text>
      </Box>
      <Flex mb={2}>
        <Button
          mr={2}
          color="gray.700"
          size="xs"
          onClick={() => {
            showForm !== "reply" ? setShowForm("reply") : setShowForm("none");
          }}
        >
          Reply
        </Button>
        {meData?.me?.user?.username === comment.user.username ? (
          <Button
            color="gray.700"
            size="xs"
            onClick={() => {
              showForm !== "edit" ? setShowForm("edit") : setShowForm("none");
            }}
          >
            Edit
          </Button>
        ) : null}
      </Flex>
      {showForm !== "none" ? (
        <Box>
          {showForm === "reply" ? (
            <Box ml={4}>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Button
                size="xs"
                colorScheme="teal"
                isLoading={fetching}
                onClick={() => {
                  // Post a comment with the current comment as the parent
                  submitReply({
                    postId: post.id,
                    parentId: comment.id,
                    text: reply,
                  });
                }}
              >
                Reply
              </Button>
            </Box>
          ) : null}
          {showForm === "edit" ? (
            <>
              <Textarea
                value={edit}
                onChange={(e) => setEdit(e.target.value)}
              />
              <Button
                size="xs"
                colorScheme="teal"
                onClick={() => console.log(edit)}
              >
                Edit
              </Button>
            </>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};
