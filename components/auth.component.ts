import type { UserModel } from "../types/user.model";
import { showToast } from "./meme-card.component.ts";

export function openLoginModal(
  users: UserModel[],
  onLoginSuccess: (user: UserModel) => void
): void {
  document.getElementById("login-modal")?.remove();

  const modal = document.createElement("div");
  modal.id = "login-modal";
  modal.className =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4";

  modal.innerHTML = `
    <div class="bg-[#1A1A1B] border border-[#343536] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-[#343536]">
        <h2 class="text-white font-bold text-lg">Bejelentkezés</h2>
        <button id="auth-close" class="text-gray-400 hover:text-white text-xl transition">✕</button>
      </div>

      <form id="login-form" class="p-5 space-y-4" novalidate>
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Felhasználónév
          </label>
          <input
            type="text"
            id="login-username"
            required
            placeholder="pl. jedlik_kiraly"
            class="w-full bg-[#272729] border border-[#343536] text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-yellow-500 transition-all"
          />
          <p id="login-error" class="text-red-400 text-xs mt-1.5 hidden"></p>
        </div>

        <div class="text-xs text-gray-500 bg-white/5 p-2.5 rounded border border-[#343536]">
          💡 <strong>Tipp:</strong> Használj egy létező nevet a <code class="mono text-yellow-400">db.json</code>-ból (pl. <code class="mono">matek_zseni</code> vagy <code class="mono">jedlik_kiraly</code>).
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" id="auth-cancel"
            class="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
            Mégse
          </button>
          <button type="submit"
            class="px-5 py-2 bg-yellow-400 text-black rounded-full text-sm font-bold hover:bg-yellow-300 transition">
            Belépés
          </button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector("#auth-close")!.addEventListener("click", closeModal);
  modal.querySelector("#auth-cancel")!.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  const form = modal.querySelector<HTMLFormElement>("#login-form")!;
  const input = modal.querySelector<HTMLInputElement>("#login-username")!;
  const errorEl = modal.querySelector<HTMLParagraphElement>("#login-error")!;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const usernameVal = input.value.trim().toLowerCase();

    if (!usernameVal) {
      input.classList.add("border-red-500");
      errorEl.textContent = "Kérlek add meg a felhasználóneved!";
      errorEl.classList.remove("hidden");
      return;
    }

    const foundUser = users.find((u) => u.username.toLowerCase() === usernameVal);

    if (foundUser) {
      onLoginSuccess(foundUser);
      closeModal();
    } else {
      input.classList.add("border-red-500");
      errorEl.textContent = "Ez a felhasználónév nem létezik!";
      errorEl.classList.remove("hidden");
    }
  });
}