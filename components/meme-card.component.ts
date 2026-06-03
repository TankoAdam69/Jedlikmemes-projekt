import type { MemeModel } from "../types/meme.model";
import type { UserModel } from "../types/user.model";
import { voteMeme, deleteMeme } from "../api/http.service";

export function renderMemeCard(
  meme: MemeModel,
  users: UserModel[],
  onDelete: (id: number) => void,
  onEdit: (meme: MemeModel) => void
): string {
  const author = users.find((u) => Number(u.id) === meme.authorId);
  const authorName = author?.username ?? "ismeretlen";
  const score = meme.upvotes - meme.downvotes;
  const date = new Date(meme.createdAt).toLocaleDateString("hu-HU");

  return `
    <article
      class="bg-[#1A1A1B] border border-[#343536] rounded-md flex flex-col sm:flex-row overflow-hidden hover:border-gray-500 transition"
      data-meme-id="${meme.id}"
    >
      <!-- Szavazó sáv -->
      <div class="w-full sm:w-12 bg-[#151516] p-2 flex sm:flex-col items-center justify-around sm:justify-start gap-1 border-b sm:border-b-0 sm:border-r border-[#343536]">
        <button
          class="vote-btn hover:bg-white/10 p-1 rounded text-xl text-gray-400 hover:text-yellow-400 transition"
          data-id="${meme.id}" data-vote="up"
          title="Upvote"
        >▲</button>
        <span class="vote-score text-xs font-bold mono ${score > 0 ? "text-yellow-400" : score < 0 ? "text-blue-400" : "text-gray-400"}">${score}</span>
        <button
          class="vote-btn hover:bg-white/10 p-1 rounded text-xl text-gray-400 hover:text-blue-400 transition"
          data-id="${meme.id}" data-vote="down"
          title="Downvote"
        >▼</button>
      </div>

      <!-- Tartalom -->
      <div class="flex-1 p-3">
        <div class="flex items-center justify-between gap-2 text-[10px] sm:text-xs text-gray-500 mb-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-gray-300">u/${authorName}</span>
            <span>·</span>
            <span>${date}</span>
            <span class="px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 text-[10px] font-mono">${meme.category}</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="edit-btn px-2 py-0.5 text-[10px] text-gray-400 hover:text-yellow-400 hover:bg-white/5 rounded transition"
              data-id="${meme.id}"
            >✏️ Szerkesztés</button>
            <button
              class="delete-btn px-2 py-0.5 text-[10px] text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition"
              data-id="${meme.id}"
            >🗑️ Törlés</button>
          </div>
        </div>

        <h2 class="text-base sm:text-lg font-semibold text-white mb-3 leading-snug">${meme.title}</h2>

        <div class="bg-black rounded border border-[#343536] flex items-center justify-center overflow-hidden w-full">
          <img
            src="${meme.imageUrl}"
            alt="${meme.title}"
            class="w-full object-cover max-h-[400px]"
            loading="lazy"
          />
        </div>
      </div>
    </article>`;
}

export function attachMemeCardListeners(
  container: HTMLElement,
  getMemeList: () => MemeModel[],
  setMemeList: (memes: MemeModel[]) => void,
  onDelete: (id: number) => void,
  onEdit: (meme: MemeModel) => void
): void {
  container.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    const voteBtn = target.closest<HTMLButtonElement>(".vote-btn");
    if (voteBtn) {
      const id = Number(voteBtn.dataset.id);
      const type = voteBtn.dataset.vote as "up" | "down";
      
      const meme = getMemeList().find((m) => Number(m.id) === id);
      
      if (!meme) {
        console.error(`Nem található mém ezzel az ID-val: ${id}`);
        return;
      }

      try {
        const updated = await voteMeme(meme, type);
        
        setMemeList(getMemeList().map((m) => (Number(m.id) === id ? updated : m)));
        
        const card = container.querySelector(`[data-meme-id="${id}"]`);
        if (card) {
          const scoreEl = card.querySelector<HTMLSpanElement>(".vote-score");
          if (scoreEl) {
            const newScore = updated.upvotes - updated.downvotes;
            scoreEl.textContent = String(newScore);

            scoreEl.classList.remove("text-yellow-400", "text-blue-400", "text-gray-400");
            if (newScore > 0) {
              scoreEl.classList.add("text-yellow-400");
            } else if (newScore < 0) {
              scoreEl.classList.add("text-blue-400");
            } else {
              scoreEl.classList.add("text-gray-400");
            }
          }
        }
      } catch (err) {
        console.error("Szavazási hiba:", err);
        showToast("Szavazás sikertelen!", "error");
      }
      return;
    }

    const deleteBtn = target.closest<HTMLButtonElement>(".delete-btn");
    if (deleteBtn) {
      const id = Number(deleteBtn.dataset.id);
      onDelete(id);
      return;
    }

    const editBtn = target.closest<HTMLButtonElement>(".edit-btn");
    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      const meme = getMemeList().find((m) => Number(m.id) === id);
      if (meme) onEdit(meme);
    }
  });
}

export function showToast(message: string, type: "success" | "error" = "success"): void {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-4 right-4 z-[100] flex flex-col gap-2";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `
    px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-300 opacity-0 translate-y-2
    ${type === "success" ? "bg-yellow-400 text-black" : "bg-red-500 text-white"}
  `;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
