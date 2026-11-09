
const WHATSAPP_NUMBER = "2250777087409";
const money = n => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year"); if(year) year.textContent = new Date().getFullYear();
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(a => { if(a.dataset.page === page) a.classList.add("active"); });
  const toggle = document.getElementById("menuToggle"), nav = document.getElementById("mainNav");
  if(toggle && nav) toggle.addEventListener("click", () => { const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); toggle.textContent = open ? "✕" : "☰"; });
  initShop();
  const form = document.getElementById("bookingForm");
  if(form) form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("clientName").value.trim();
    const phone = document.getElementById("clientPhone").value.trim();
    const service = document.getElementById("service").value;
    const date = document.getElementById("bookingDate").value;
    const message = document.getElementById("bookingMessage").value.trim();
    const text = `Bonjour ZB FASHION / ZB Barber, je souhaite demander un rendez-vous.\nNom : ${name}\nTéléphone : ${phone}\nPrestation : ${service}\nDate souhaitée : ${date}\nPrécisions : ${message || "Aucune"}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
});
function initShop(){
  const grid = document.getElementById("productGrid"); if(!grid || typeof PRODUCTS === "undefined") return;
  let filter = "Tous";
  const cart = JSON.parse(localStorage.getItem("zbCart") || "[]");
  const render = () => {
    const items = filter === "Tous" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
    grid.innerHTML = items.map((p) => {
      const index = PRODUCTS.indexOf(p);
      const images = p.images?.length ? p.images : [p.image];
      const gallery = images.map((image, imageIndex) => `
        <button class="gallery-thumb${imageIndex === 0 ? " active" : ""}" type="button"
          data-gallery-image="${imageIndex}" aria-label="Afficher l’image ${imageIndex + 1} de ${p.name}"
          aria-pressed="${imageIndex === 0}">
          <img src="${image}" alt="" loading="lazy">
        </button>`).join("");
      return `<article class="product-card"><div class="product-gallery">
        <div class="product-img"><img class="gallery-main-image" src="${images[0]}" alt="${p.name} — vue 1" loading="lazy" onerror="this.src='https://placehold.co/600x700/211b27/ffffff?text=ZB+FASHION'"></div>
        <div class="gallery-thumbnails" role="group" aria-label="Images de ${p.name}">${gallery}</div>
      </div><div class="product-info"><small>${p.category}</small><h3>${p.name}</h3><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" data-add="${index}">Ajouter +</button></div></div></article>`;
    }).join("");
  };
  const updateCart = () => {
    localStorage.setItem("zbCart", JSON.stringify(cart));
    const count = cart.reduce((sum,item)=>sum+item.qty,0);
    const countEl = document.getElementById("cartCount"); if(countEl) countEl.textContent = count;
    const itemsEl = document.getElementById("cartItems");
    if(itemsEl) itemsEl.innerHTML = cart.length ? cart.map((item,i)=>`<div class="cart-item"><span>${item.name}<br><small>${money(item.price)} × ${item.qty}</small></span><span><button data-minus="${i}" aria-label="Retirer un article">−</button> ${item.qty} <button data-plus="${i}" aria-label="Ajouter un article">+</button></span></div>`).join("") : '<p class="empty-state">Ton panier est vide.</p>';
    const total = cart.reduce((sum,item)=>sum+item.price*item.qty,0);
    const totalEl = document.getElementById("cartTotal"); if(totalEl) totalEl.textContent = money(total);
  };
  document.getElementById("filters")?.addEventListener("click",e=>{
    const btn=e.target.closest("[data-filter]"); if(!btn)return;
    filter=btn.dataset.filter; document.querySelectorAll(".filter-btn").forEach(b=>b.classList.toggle("active",b===btn)); render();
  });
  grid.addEventListener("click",e=>{
    const thumbnail=e.target.closest("[data-gallery-image]");
    if(thumbnail){
      const card=thumbnail.closest(".product-card");
      const p=PRODUCTS[Number(card?.querySelector("[data-add]")?.dataset.add)];
      const image=p?.images?.[Number(thumbnail.dataset.galleryImage)];
      if(image && card){
        const mainImage=card.querySelector(".gallery-main-image");
        if(mainImage && mainImage.src!==image){
          mainImage.classList.add("is-changing");
          mainImage.addEventListener("load",()=>mainImage.classList.remove("is-changing"),{once:true});
          mainImage.addEventListener("error",()=>mainImage.classList.remove("is-changing"),{once:true});
          mainImage.src=image;
          mainImage.alt=`${p.name} — vue ${Number(thumbnail.dataset.galleryImage)+1}`;
        }
        card.querySelectorAll("[data-gallery-image]").forEach(button=>{
          const selected=button===thumbnail;
          button.classList.toggle("active",selected);
          button.setAttribute("aria-pressed",String(selected));
        });
      }
      return;
    }
    const btn=e.target.closest("[data-add]"); if(!btn)return;
    const p=PRODUCTS[Number(btn.dataset.add)]; const found=cart.find(x=>x.name===p.name);
    if(found) found.qty++; else cart.push({...p,qty:1}); updateCart();
    const panel=document.getElementById("cartPanel"); if(panel) panel.classList.add("open");
  });
  const panel=document.getElementById("cartPanel");
  document.getElementById("cartOpen")?.addEventListener("click",e=>{ if(panel){e.preventDefault();panel.classList.toggle("open");} });
  document.getElementById("cartClose")?.addEventListener("click",()=>panel?.classList.remove("open"));
  panel?.addEventListener("click",e=>{
    const plus=e.target.closest("[data-plus]"), minus=e.target.closest("[data-minus]");
    if(plus) cart[Number(plus.dataset.plus)].qty++;
    if(minus){const i=Number(minus.dataset.minus);cart[i].qty--;if(cart[i].qty<=0)cart.splice(i,1);}
    updateCart();
  });
  document.getElementById("checkoutBtn")?.addEventListener("click",()=>{
    if(!cart.length){alert("Ton panier est vide.");return;}
    const total=cart.reduce((s,p)=>s+p.price*p.qty,0);
    const lines=cart.map(p=>`- ${p.name} x${p.qty} : ${money(p.price*p.qty)}`).join("\n");
    const msg=`Bonjour ZB FASHION, je souhaite commander :\n${lines}\nTotal estimatif : ${money(total)}\nMerci de confirmer la disponibilité, les tailles, les couleurs et la livraison.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,"_blank","noopener");
  });
  render();updateCart();
}
