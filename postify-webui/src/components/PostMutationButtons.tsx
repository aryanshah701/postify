import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { IconButton, Link } from "@chakra-ui/react";
import React from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface PostMutationButtonsProps {
  postId: number;
  onDeletePost?: () => void;
  editHref: string;
  editAs: string;
}

export const PostMutationButtons: React.FC<PostMutationButtonsProps> = ({
  postId,
  onDeletePost,
  editHref,
  editAs,
}) => {
  const [{ fetching }, deletePost] = useDeletePostMutation();

  return (
    <>
      <NextLink href={editHref} as={editAs}>
        <IconButton
          icon={<EditIcon />}
          as={Link}
          variant="outline"
          aria-label="Edit post"
          colorScheme="yellow"
          mr={2}
        />
      </NextLink>
      <IconButton
        icon={<DeleteIcon />}
        variant="outline"
        aria-label="Delete post"
        colorScheme="red"
        isLoading={fetching}
        onClick={async () => {
          await deletePost({ id: postId });
          onDeletePost ? onDeletePost() : null;
        }}
      />
    </>
  );
};
