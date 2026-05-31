import type { UserModel} from "./user.model"
import type { MemeModel } from "./meme.model"

const USERS_BASE_URL = "http://localhost:3000/users"
const MEMES_BASE_URL = "http://localhost:3000/memes"

export async function getMemes() {
    let url = MEMES_BASE_URL;
    const response = await fetch(url)
    if (!response) throw new Error("Hiba lekéréskor");
    return await response.json()
}

export async function getUsers() {
    let url = USERS_BASE_URL;
    const response = await fetch(url)
    if (!response) throw new Error("Hiba lekéréskor");
    return await response.json()
}