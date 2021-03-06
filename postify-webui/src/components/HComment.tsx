import { Box, ChakraProps } from "@chakra-ui/react";
import React from "react";
import {
  CommentFieldsFragment,
  HCommentFieldsFragment,
  RegularPostFragment,
} from "../generated/graphql";
import { Comment } from "./Comment";

interface HCommentProps extends ChakraProps {
  hcomment: {
    id: number;
    comment: CommentFieldsFragment;
    children?: HCommentFieldsFragment[];
  };
  post: RegularPostFragment;
}

//Recursive component: A Hierarchical Comment with all of its direct and indirect children(replies)
export const HComment: React.FC<HCommentProps> = ({
  hcomment,
  post,
  ...props
}) => {
  return (
    <Box my={6}>
      <Comment comment={hcomment.comment} post={post} />
      {hcomment.children ? (
        <Box {...props}>
          {hcomment.children.map((child) => (
            <HComment
              key={child.id}
              ml={4}
              borderLeft="2px"
              borderColor="gray.200"
              pl={2}
              hcomment={child}
              post={post}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
};
