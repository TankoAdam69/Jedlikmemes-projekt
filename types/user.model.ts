export interface UserModel {
  id: number;
  username: string;
  karma: number;
  bio: string;
  joinedAt: string;
  avatar: string;
}

export type CreateUserDto = Omit<UserModel, "id">;
