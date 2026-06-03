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
import { openLoginModal } from "../components/auth.component.ts";

let allMemes: MemeModel[] = [];
let allUsers: UserModel[] = [];
let filteredMemes: MemeModel[] = [];
let currentUser: UserModel | null = null;

const main = document.getElementById("memes-main")!;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const authContainer = document.getElementById("nav-auth-container")!;
const sidebarMemeBtn = document.getElementById("new-meme-btn-sidebar") as HTMLButtonElement;
const categoryList = document.getElementById("category-list");

async function loadAll(): Promise<void> {
  try {
    [allMemes, allUsers] = await Promise.all([getMemes(), getUsers()]);
    filteredMemes = [...allMemes];

    const storedUser = localStorage.getItem("jedlik_user");
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }

    renderAuthUI();
    renderFeed(filteredMemes);
    setupCategoryFilters();
  } catch (err) {
    renderError("Nem sikerült betölteni az adatokat.");
    console.error(err);
  }
}

function renderAuthUI(): void {
  if (currentUser) {
    authContainer.innerHTML = `
      <div class="flex items-center gap-2 bg-[#272729] px-3 py-1.5 rounded-full border border-[#343536]">
        <span class="text-sm">${currentUser.avatar}</span>
        <span class="text-xs font-bold text-white hidden sm:inline">u/${currentUser.username}</span>
      </div>
      <button id="new-meme-btn" class="px-3 py-1.5 bg-yellow-400 text-black rounded-full text-xs sm:text-sm font-semibold hover:bg-yellow-300 transition">
        + Mém
      </button>
      <button id="logout-btn" class="px-2 py-1.5 text-gray-400 hover:text-white rounded-full text-xs sm:text-sm font-medium transition">
        Kijelentkezés
      </button>
    `;

    document.getElementById("new-meme-btn")?.addEventListener("click", handleCreate);
    document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
    if (sidebarMemeBtn) sidebarMemeBtn.disabled = false;
  } else {
    authContainer.innerHTML = `
      <button id="login-btn" class="px-4 py-1.5 bg-yellow-400 text-black rounded-full text-xs sm:text-sm font-bold hover:bg-yellow-300 transition">
        Bejelentkezés
      </button>
    `;

    document.getElementById("login-btn")?.addEventListener("click", () => {
      openLoginModal(allUsers, (user) => {
        currentUser = user;
        localStorage.setItem("jedlik_user", JSON.stringify(user));
        showToast(`Üdv újra, ${user.username}! 👋`);
        renderAuthUI();
      });
    });

    if (sidebarMemeBtn) sidebarMemeBtn.disabled = true;
  }
}

function handleLogout(): void {
  currentUser = null;
  localStorage.removeItem("jedlik_user");
  showToast("Sikeresen kijelentkeztél! 🔒");
  renderAuthUI();
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
  const existingList = document.getElementById("meme-list");
  const emptyContainer = document.createElement("div");
  emptyContainer.id = "meme-list";
  emptyContainer.className = "flex-1 order-1 flex flex-col items-center justify-center py-24 gap-3 text-center w-full";
  emptyContainer.innerHTML = `
    <span class="text-5xl">🦗</span>
    <p class="text-gray-400">Nincs találat.</p>
    <p class="text-gray-600 text-sm">Próbálj más keresési kifejezést, vagy tölts fel új mémet!</p>`;

  if (existingList) {
    existingList.replaceWith(emptyContainer);
  } else {
    main.appendChild(emptyContainer);
  }
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
    .map((m) => renderMemeCard(m, allUsers, handleDelete, handleEdit))
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
  if (!currentUser) {
    showToast("Szerkesztéshez be kell jelentkezned!", "error");
    return;
  }

  openMemeModal(allUsers, async (data: CreateMemeDto) => {
    const updated = await updateMeme(meme.id, data);
    allMemes = allMemes.map((m) => (m.id === meme.id ? updated : m));
    applyFilter();
    showToast("Mém frissítve! ✅");
  }, meme);
}

function handleCreate(): void {
  if (!currentUser) {
    showToast("Mém feltöltéséhez be kell jelentkezned!", "error");
    return;
  }

  openMemeModal([currentUser], async (data: CreateMemeDto) => {
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

function setupCategoryFilters(): void {
  categoryList?.addEventListener("click", (e) => {
    const item = (e.target as HTMLElement).closest("li");
    if (!item) return;
    const cat = item.dataset.cat ?? "";
    if (searchInput) {
      searchInput.value = cat;
      applyFilter();
    }
  });
}

searchInput?.addEventListener("input", applyFilter);
sidebarMemeBtn?.addEventListener("click", handleCreate);

await loadAll();