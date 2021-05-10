import DataLoader from "dataloader";
import { Vote } from "../entities/Vote";

export const createVoteLoaderWithUserId = () => {
  return new DataLoader<{ userId: number; postId: number }, Vote>(
    async (keys) => {
      // Grab the votes from the db
      const votes = await Vote.findByIds(
        keys as { userId: number; postId: number }[]
      );

      // Shape into array of Votes ordered by the given array of keys
      const voteKeysToVoteMap: Record<string, Vote> = {};
      votes.forEach(
        (vote) => (voteKeysToVoteMap[`${vote.userId}|${vote.postId}`] = vote)
      );

      return keys.map(
        (key) => voteKeysToVoteMap[`${key.userId}|${key.postId}`]
      );
    }
  );
};
