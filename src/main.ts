import {
  getMemes,
  getUsers,
  createMeme,
  updateMeme,
  deleteMeme,
} from "../api/http.service";
import type { MemeModel } from "../types/meme.model";
import type { UserModel } from "../types/user.model";
import type { CreateMemeDto } from "../types/meme.model";
import {
  renderMemeCard,
  attachMemeCardListeners,
  showToast,
} from "../components/meme-card.component";
import { openMemeModal } from "../components/meme-form.component";

let allMemes: MemeModel[] = [];
let allUsers: UserModel[] = [];
let filteredMemes: MemeModel[] = [];

const main = document.getElementById("memes-main")!;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const newMemeBtn = document.getElementById("new-meme-btn");



async function loadAll(): Promise<void> {
  try {
    [allMemes, allUsers] = await Promise.all([getMemes(), getUsers()]);
    filteredMemes = [...allMemes];
    renderFeed(filteredMemes);
  } catch (err) {
    renderError("Nem sikerült betölteni az adatokat.");
    console.error(err);
  }
}


function renderError(message: string): void {
  main.innerHTML = `
    <div class="flex flex-col items-center justify-center py-24 gap-3 text-center w-full">
      <span class="text-4xl">⚠️</span>
      <p class="text-red-400 font-semibold">${message}</p>
      <button onclick="location.reload()" class="mt-2 px-4 py-1.5 bg-yellow-400 text-black rounded-full text-sm font-bold hover:bg-yellow-300 transition">
        Újratöltés
      </button>
    </div>`;
}

function renderEmpty(): void {
  main.innerHTML = `
    <div class="flex flex-col items-center justify-center py-24 gap-3 text-center w-full">
      <span class="text-5xl">🦗</span>
      <p class="text-gray-400">Nincs találat.</p>
      <p class="text-gray-600 text-sm">Próbálj más keresési kifejezést, vagy töltj fel új mémet!</p>
    </div>`;
}

function renderFeed(memes: MemeModel[]): void {
  if (memes.length === 0) {
    renderEmpty();
    return;
  }

  const listContainer = document.createElement("div");
  listContainer.id = "meme-list";
  listContainer.className = "flex-1 order-1 flex flex-col gap-4";


  listContainer.innerHTML = memes
    .map((m) =>
      renderMemeCard(
        m,
        allUsers,
        handleDelete,
        handleEdit
      )
    )
    .join("");

  attachMemeCardListeners(
    listContainer,
    () => allMemes,
    (updated) => {
      allMemes = updated;
      filteredMemes = filteredMemes.map(m => {
        const fresh = updated.find(u => Number(u.id) === Number(m.id));
        return fresh ? fresh : m;
      });
    },
    handleDelete,
    handleEdit
  );

  const existingList = document.getElementById("meme-list");
  if (existingList) {
    existingList.replaceWith(listContainer);
  } else {
    const aside = main.querySelector("aside");
    if (aside) {
      main.insertBefore(listContainer, aside);
    } else {
      main.appendChild(listContainer);
    }
  }

  attachMemeCardListeners(
    listContainer,
    () => allMemes,
    (updated) => { allMemes = updated; },
    handleDelete,
    handleEdit
  );
}

async function handleDelete(id: number): Promise<void> {
  const meme = allMemes.find((m) => m.id === id);
  const title = meme?.title ?? "ezt a mémét";
  const confirmed = confirm(`Biztosan törölni akarod:\n"${title}"?`);
  if (!confirmed) return;

  try {
    await deleteMeme(id);
    allMemes = allMemes.filter((m) => m.id !== id);
    applyFilter();
    showToast("Mém törölve! 🗑️");
  } catch {
    showToast("Törlés sikertelen!", "error");
  }
}

function handleEdit(meme: MemeModel): void {
  openMemeModal(allUsers, async (data: CreateMemeDto) => {
    const updated = await updateMeme(meme.id, data);
    allMemes = allMemes.map((m) => (m.id === meme.id ? updated : m));
    applyFilter();
    showToast("Mém frissítve! ✅");
  }, meme);
}

function handleCreate(): void {
  openMemeModal(allUsers, async (data: CreateMemeDto) => {
    const created = await createMeme(data);
    allMemes = [created, ...allMemes];
    applyFilter();
    showToast("Mém feltöltve! 🎉");
  });
}


function applyFilter(): void {
  const query = searchInput?.value.trim().toLowerCase() ?? "";
  filteredMemes = allMemes.filter(
    (m) =>
      m.title.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query)
  );
  renderFeed(filteredMemes);
}


searchInput?.addEventListener("input", applyFilter);
newMemeBtn?.addEventListener("click", handleCreate);


await loadAll();
