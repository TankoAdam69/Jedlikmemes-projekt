import { getMemes, getUsers } from "./http.service";
import type { UserModel } from "./user.model";
import type { MemeModel } from "./meme.model";

function renderMemes (memes: MemeModel[], users : UserModel[]){
    const main = document.getElementById("memes-main")!
    main.innerHTML = ""
    memes.forEach( meme => {
        let authorName = ""
        users.forEach( (user) => {
            if (user.id == meme.authorId) {
                authorName = user.username
            }
        })
        const card = `    
        <section class="flex-1 order-1">
          
          <article class="bg-[#1A1A1B] border border-[#343536] rounded-md flex flex-col sm:flex-row overflow-hidden hover:border-gray-500 transition">
            
            <div class="w-full sm:w-12 bg-[#151516] p-2 flex sm:flex-col items-center justify-around sm:justify-start gap-1 border-b sm:border-b-0 sm:border-r border-[#343536]">
              <button class="hover:bg-white/10 p-1 rounded text-xl text-gray-400 hover:text-yellow-400">▲</button>
              <span class="text-xs font-bold mono">${meme.upvotes - meme.downvotes}</span>
              <button class="hover:bg-white/10 p-1 rounded text-xl text-gray-400 hover:text-blue-400">▼</button>
            </div>
    
            <div class="flex-1 p-3">
              <div class="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-2">
                <span class="font-bold text-gray-300">u/${authorName}</span>
              </div>
              <h2 class="text-base sm:text-lg font-semibold text-white mb-3">${meme.title}</h2>
              
              <div class="bg-black rounded border border-[#343536] flex items-center justify-center aspect-video w-full">
              <img src="${meme.imageUrl}" alt="">
              </div>
            </div>
          </article>
    
        </section>`
        main.innerHTML += card
    })
}

renderMemes(await getMemes(), await getUsers())