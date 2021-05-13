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
): boolean => {
  // If the new comment's parent is null then insert it at the top level
  if (!newComment.parentId) {
    hcomments.push({
      id: newComment.id,
      comment: newComment,
      children: [],
      __typename: "HierarchicalComment",
    });

    return true;
  }

  // Insert the new comment in the  appropriate postition in the hierarchical structure
  for (const hcomment of hcomments) {
    // Should have been inserted here but couldn't since children aren't loaded
    const rv = insertIntoHComment(hcomment, newComment);
    if (rv === null) {
      return false;

      // Successfully inserted
    } else if (rv) {
      return true;
    }
  }

  return true;
};

/* 
  Return true or false based on whether it was inserted into this HComment
  Return null if it was supposed to be inserted into this HComment but wasn't
  since the parent doesn't have its children array loaded.
*/
const insertIntoHComment = (
  hcomment: HierarchicalComment,
  newComment: CommentFieldsFragment
): boolean | null => {
  // Is this level the parent of the new comment, if so insert
  if (hcomment.id === newComment.parentId) {
    // If the chidldren field is loaded
    if (hcomment.children) {
      hcomment.children.push({
        id: newComment.id,
        comment: newComment,
        children: [],
        __typename: "HierarchicalComment",
      });

      return true;
    } else {
      // Children isn't loaded so need to invalidate the cache
      return null;
    }
  }

  // Try inserting the new comment in any of the children
  if (hcomment.children) {
    for (const child of hcomment.children) {
      if (insertIntoHComment(child, newComment)) return true;
    }
  } else {
    // Children isn't loaded so need to invalidate the cache
    return null;
  }

  // Couldn't find parent here so return false
  return false;
};
