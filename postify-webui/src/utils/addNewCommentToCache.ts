import { CommentFieldsFragment } from "../generated/graphql";

type HierarchicalComment = {
  id: number;
  comment: CommentFieldsFragment;
  children: HierarchicalComment[];
  __typename: string;
};

export const addNewCommentToCache = (
  hcomments: HierarchicalComment[],
  newComment: CommentFieldsFragment
) => {
  // Insert the new comment in the  appropriate postition in the hierarchical structure
  for (const hcomment of hcomments) {
    if (insertIntoHComment(hcomment, newComment)) break;
  }
};

const insertIntoHComment = (
  hcomment: HierarchicalComment,
  newComment: CommentFieldsFragment
): boolean => {
  // Is this level the parent of the new comment, if so insert
  if (hcomment.id === newComment.parentId) {
    hcomment.children.push({
      id: newComment.id,
      comment: newComment,
      children: [],
      __typename: "HierarchicalComment",
    });
    return true;
  }

  // Try inserting the new comment in any of the children
  for (const child of hcomment.children) {
    if (insertIntoHComment(child, newComment)) return true;
  }

  // Couldn't find parent here so return false
  return false;
};
