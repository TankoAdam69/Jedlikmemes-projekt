import type { MemeModel, MemeCategory, CreateMemeDto } from "../types/meme.model";
import type { UserModel } from "../types/user.model";

const CATEGORIES: MemeCategory[] = [
  "matek",
  "fizika",
  "informatika",
  "irodalom",
  "történelem",
  "egyéb",
];

export function openMemeModal(
  users: UserModel[],
  onSubmit: (data: CreateMemeDto) => Promise<void>,
  existing?: MemeModel
): void {
  document.getElementById("meme-modal")?.remove();

  const isEdit = !!existing;
  const title = isEdit ? "Meme szerkesztése" : "Új meme feltöltése";

  const userOptions = users
    .map(
      (u) =>
        `<option value="${u.id}" ${existing?.authorId === u.id ? "selected" : ""}>${u.avatar} u/${u.username}</option>`
    )
    .join("");

  const categoryOptions = CATEGORIES.map(
    (c) =>
      `<option value="${c}" ${existing?.category === c ? "selected" : ""}>${c}</option>`
  ).join("");

  const modal = document.createElement("div");
  modal.id = "meme-modal";
  modal.className =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4";

  modal.innerHTML = `
    <div class="bg-[#1A1A1B] border border-[#343536] rounded-xl w-full max-w-lg shadow-2xl">
      <div class="flex items-center justify-between px-5 py-4 border-b border-[#343536]">
        <h2 class="text-white font-bold text-lg">${title}</h2>
        <button id="modal-close" class="text-gray-400 hover:text-white text-xl transition">✕</button>
      </div>

      <form id="meme-form" class="p-5 space-y-4" novalidate>

        <!-- Cím -->
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Cím <span class="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            placeholder="Mi a meme lényege?"
            value="${existing?.title ?? ""}"
            class="form-input w-full bg-[#272729] border border-[#343536] text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-yellow-500 transition-all"
          />
          <p class="field-error text-red-400 text-xs mt-1 hidden"></p>
        </div>

        <!-- Kép URL -->
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Kép URL <span class="text-red-400">*</span>
          </label>
          <input
            type="url"
            name="imageUrl"
            placeholder="https://..."
            value="${existing?.imageUrl ?? ""}"
            class="form-input w-full bg-[#272729] border border-[#343536] text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-yellow-500 transition-all"
          />
          <p class="field-error text-red-400 text-xs mt-1 hidden"></p>
        </div>

        <!-- Kategória + Szerző -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Kategória</label>
            <select name="category" class="w-full bg-[#272729] border border-[#343536] text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-yellow-500 transition-all">
              ${categoryOptions}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Feltöltő</label>
            <select name="authorId" class="w-full bg-[#272729] border border-[#343536] text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-yellow-500 transition-all">
              ${userOptions}
            </select>
          </div>
        </div>

        <!-- Upvotes / Downvotes (csak szerkesztésnél) -->
        ${
          isEdit
            ? `
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Upvotes</label>
            <input type="number" name="upvotes" min="0" value="${existing!.upvotes}"
              class="form-input w-full bg-[#272729] border border-[#343536] text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-yellow-500 transition-all" />
            <p class="field-error text-red-400 text-xs mt-1 hidden"></p>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Downvotes</label>
            <input type="number" name="downvotes" min="0" value="${existing!.downvotes}"
              class="form-input w-full bg-[#272729] border border-[#343536] text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-yellow-500 transition-all" />
            <p class="field-error text-red-400 text-xs mt-1 hidden"></p>
          </div>
        </div>`
            : ""
        }

        <!-- Gombok -->
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" id="modal-cancel"
            class="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
            Mégse
          </button>
          <button type="submit"
            class="px-5 py-2 bg-yellow-400 text-black rounded-full text-sm font-bold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed">
            ${isEdit ? "Mentés" : "Feltöltés"}
          </button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(modal);

  const closeModal = (): void => modal.remove();
  modal.querySelector("#modal-close")!.addEventListener("click", closeModal);
  modal.querySelector("#modal-cancel")!.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  const form = modal.querySelector<HTMLFormElement>("#meme-form")!;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateMemeForm(form)) return;

    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    submitBtn.disabled = true;
    submitBtn.textContent = "Mentés...";

    try {
      const data = buildFormData(form, existing);
      await onSubmit(data);
      closeModal();
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? "Mentés" : "Feltöltés";
    }
  });
}


function validateMemeForm(form: HTMLFormElement): boolean {
  let valid = true;

  const fields = form.querySelectorAll<HTMLInputElement>(".form-input");
  fields.forEach((input) => {
    const errorEl = input.nextElementSibling as HTMLParagraphElement | null;
    if (!errorEl) return;

    errorEl.classList.add("hidden");
    input.classList.remove("border-red-500");

    const value = input.value.trim();

    if (input.required && !value) {
      showFieldError(input, errorEl, "Ez a mező kötelező.");
      valid = false;
      return;
    }

    if (input.type === "url" && value && !isValidUrl(value)) {
      showFieldError(input, errorEl, "Érvényes URL-t adj meg (https://...)");
      valid = false;
      return;
    }

    if (input.type === "number" && value !== "") {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        showFieldError(input, errorEl, "Nem negatív számot adj meg.");
        valid = false;
      }
    }
  });

  return valid;
}

function showFieldError(
  input: HTMLInputElement,
  errorEl: HTMLParagraphElement,
  message: string
): void {
  input.classList.add("border-red-500");
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}


function buildFormData(form: HTMLFormElement, existing?: MemeModel): CreateMemeDto {
  const fd = new FormData(form);

  return {
    title: (fd.get("title") as string).trim(),
    imageUrl: (fd.get("imageUrl") as string).trim(),
    category: fd.get("category") as MemeModel["category"],
    authorId: Number(fd.get("authorId")),
    upvotes: existing ? Number(fd.get("upvotes")) : 0,
    downvotes: existing ? Number(fd.get("downvotes")) : 0,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}
