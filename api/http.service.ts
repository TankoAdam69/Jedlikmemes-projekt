  import type { MemeModel, CreateMemeDto, UpdateMemeDto } from "../types/meme.model";
  import type { UserModel, CreateUserDto } from "../types/user.model";

  const BASE_URL = "http://localhost:3000";


  async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API hiba: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }


  export function getMemes(): Promise<MemeModel[]> {
    return apiFetch<MemeModel[]>("/memes");
  }

  export function getMemeById(id: number): Promise<MemeModel> {
    return apiFetch<MemeModel>(`/memes/${id}`);
  }

  export function createMeme(data: CreateMemeDto): Promise<MemeModel> {
    return apiFetch<MemeModel>("/memes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  export function updateMeme(id: number, data: UpdateMemeDto): Promise<MemeModel> {
    return apiFetch<MemeModel>(`/memes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  export function deleteMeme(id: number): Promise<void> {
    return apiFetch<void>(`/memes/${id}`, { method: "DELETE" });
  }

  export function voteMeme(
    meme: MemeModel,
    type: "up" | "down"
  ): Promise<MemeModel> {
    const updated: UpdateMemeDto =
      type === "up"
        ? { upvotes: meme.upvotes + 1 }
        : { downvotes: meme.downvotes + 1 };
    return updateMeme(meme.id, updated);
  }


  export function getUsers(): Promise<UserModel[]> {
    return apiFetch<UserModel[]>("/users");
  }

  export function getUserById(id: number): Promise<UserModel> {
    return apiFetch<UserModel>(`/users/${id}`);
  }

  export function createUser(data: CreateUserDto): Promise<UserModel> {
    return apiFetch<UserModel>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  export function deleteUser(id: number): Promise<void> {
    return apiFetch<void>(`/users/${id}`, { method: "DELETE" });
  }
