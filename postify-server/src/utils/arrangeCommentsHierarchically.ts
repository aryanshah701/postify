import { HierarchicalComment } from "../types";
import { Comment } from "../entities/Comment";

// Arrange all root comments hierarchically
export const arrangeCommentsHierarchically = (
  comments: Comment[]
): HierarchicalComment[] => {
  // Grab all root level comments
  const rootComments = comments.filter((c) => !c.parentId);

  // Arrange each root comment hierarchically and push into array
  const hComments: HierarchicalComment[] = [];
  rootComments.forEach((rc) => {
    const hierachicalRootComment = arrangeCommentHierarchically(comments, rc);
    hComments.push(hierachicalRootComment);
  });

  return hComments;
};

// Arrange a single comment hierarchically
const arrangeCommentHierarchically = (
  comments: Comment[],
  comment: Comment
): HierarchicalComment => {
  // Grab the comment's children
  const immidiateChildren = comments.filter((c) => c.parentId === comment.id);

  // Immidate children need not be considered for future recursive calls
  const nextLevelsComments = comments.filter((c) => c.parentId !== comment.id);

  // Compute the heirarchicalComment for each child
  const hChildren: HierarchicalComment[] = [];
  immidiateChildren.forEach((child) => {
    const hChild = arrangeCommentHierarchically(nextLevelsComments, child);
    hChildren.push(hChild);
  });

  return { comment, children: hChildren };
};
