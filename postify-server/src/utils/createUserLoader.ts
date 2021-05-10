import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = () => {
  return new DataLoader<number, User>(async (userIds) => {
    // Grab the users from the db
    const users = await User.findByIds(userIds as number[]);

    // Shape into array of Users ordered by the given array of userIds
    const userIdToUserMap: Record<number, User> = {};
    users.forEach((user) => (userIdToUserMap[user.id] = user));

    return userIds.map((id) => userIdToUserMap[id]);
  });
};
