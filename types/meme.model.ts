export type MemeCategory =
  | "matek"
  | "fizika"
  | "informatika"
  | "irodalom"
  | "történelem"
  | "egyéb";

export interface MemeModel {
  id: number;
  title: string;
  imageUrl: string;
  upvotes: number;
  downvotes: number;
  category: MemeCategory;
  authorId: number;
  createdAt: string;
}

export type CreateMemeDto = Omit<MemeModel, "id">;
export type UpdateMemeDto = Partial<CreateMemeDto>;
