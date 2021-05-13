import React, { useState } from "react";
import {
  CommentFieldsFragment,
  RegularPostFragment,
  useCommentMutation,
  useMeQuery,
  useUpdateCommentMutation,
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
import { timeElapsed } from "../utils/timeElapsed";

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
  const [edit, setEdit] = useState(comment.text);
  const [showForm, setShowForm] = useState<"none" | "edit" | "reply">("none");

  // To submit a reply or edit this comment
  const [{ fetching: fetchingReply }, submitReply] = useCommentMutation();
  const [{ fetching: fetchingEdit }, editComment] = useUpdateCommentMutation();

  const createCommentAction = async () => {
    // Post a comment with the current comment as the parent
    await submitReply({
      postId: post.id,
      parentId: comment.id,
      text: reply,
    });
    setShowForm("none");
    setReply("");
  };

  const editCommentAction = async () => {
    // Edit this comment
    await editComment({
      id: comment.id,
      postId: post.id,
      text: edit,
    });
    setShowForm("none");
    setEdit("");
  };

  return (
    <Box my={2}>
      <Box mb={2}>
        <Text mb={1} as="h4" color="gray.600" size="sm">
          {comment.user.username} · {timeElapsed(comment.createdAt)} ago
        </Text>
        <Text lineHeight={1.2} {...props}>
          {comment.text}
        </Text>
      </Box>
      <Flex mb={2}>
        {comment.depth >= 20 ? null : (
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
        )}
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
                isLoading={fetchingReply}
                onClick={createCommentAction}
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
                isLoading={fetchingEdit}
                onClick={editCommentAction}
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
