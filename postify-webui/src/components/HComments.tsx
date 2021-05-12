import { Box } from "@chakra-ui/react";
import React from "react";
import {
  CommentsRecursiveFragment,
  RegularPostFragment,
} from "../generated/graphql";
import { HComment } from "./HComment";

interface HCommentsProps {
  hcomments: CommentsRecursiveFragment[];
  post: RegularPostFragment;
}

// The component to display all comments on a post in hierarchical fassion
export const HComments: React.FC<HCommentsProps> = ({ hcomments, post }) => {
  const hcommentsComponent = hcomments.map((hcomment) => (
    <Box my={5}>
      <HComment
        key={hcomment.id}
        ml={4}
        borderLeft="2px"
        borderColor="gray.200"
        pl={2}
        hcomment={hcomment}
        post={post}
      />
    </Box>
  ));

  return (
    <Box borderLeft="2px" borderColor="gray.200" pl={2} ml={0}>
      {hcommentsComponent}
    </Box>
  );
};
