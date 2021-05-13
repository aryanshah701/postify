import { CommentFieldsFragment } from "../generated/graphql";

type HierarchicalComment = {
  id: number;
  comment: CommentFieldsFragment;
  children: HierarchicalComment[];
  __typename: string;
};

export const updateCommentInCache = (
  hcomments: HierarchicalComment[],
  newComment: CommentFieldsFragment
): boolean => {
  // Search for the comment
  for (const hcomment of hcomments) {
    if (findAndUpdateHComment(hcomment, newComment)) return true;
  }

  return false;
};

const findAndUpdateHComment = (
  hcomment: HierarchicalComment,
  newComment: CommentFieldsFragment
): boolean => {
  // Base
  if (hcomment.id === newComment.id) {
    hcomment.comment.text = newComment.text;
    return true;
  }

  // Recurse on children if there
  if (hcomment.children) {
    for (const child of hcomment.children) {
      if (findAndUpdateHComment(child, newComment)) return true;
    }
  }

  // The comment isn't a part of this thread
  return false;
};
