// ===============================
// БЕЗПЕЧНЕ ЗЧИТУВАННЯ ОБРАНОГО
// ===============================
function safeGetFavorites() {
  try {
    const raw = localStorage.getItem("favorites");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Помилка парсу favorites:", e);
    return [];
  }
}

// ===============================
// ПЕРЕВІРКА ЧИ ТОВАР В ОБРАНОМУ
// ===============================
function isInFavorites(item) {
  const favs = safeGetFavorites();
  return favs.some(f => f.code === item.code);
}

// ===============================
// ДОДАТИ В ОБРАНЕ
// ===============================
function addToFavorites(item) {
  let favs = safeGetFavorites();

  const normalized = {
    code: item.code || "",
    name: item.name,
    category: item.category,
    available: item.available,
    description: item.description,
    image: item.image || "images/placeholder.png"
  };

  if (!favs.find(f => f.code === normalized.code)) {
    favs.push(normalized);
    localStorage.setItem("favorites", JSON.stringify(favs));
  }
}

// ===============================
// ВИДАЛИТИ З ОБРАНОГО
// ===============================
function removeFromFavorites(item) {
  let favs = safeGetFavorites();
  favs = favs.filter(f => f.code !== item.code);
  localStorage.setItem("favorites", JSON.stringify(favs));

  if (typeof IS_FAVORITES_PAGE !== "undefined" && IS_FAVORITES_PAGE) {
    renderFavs();
  }
}

// ===============================
// ВІДКРИТТЯ МОДАЛКИ
// ===============================
function openModal(item) {
  currentItem = item;

  const modalOverlay = document.querySelector(".overlay");
  if (!modalOverlay) return;

  document.getElementById("modalImage").src = item.image || "images/placeholder.png";
  document.querySelector(".modal-title").textContent = item.name;
  document.querySelector(".modal-category").textContent = item.category;
  document.querySelector(".modal-availability").textContent =
    item.available ? "Є в наявності" : "Немає";
  document.querySelector(".modal-availability").className =
    "modal-availability " + (item.available ? "yes" : "no");
  document.querySelector(".modal-code").textContent = item.code || "";
  document.getElementById("modalDescription").textContent = item.description || "";

  const btn = document.getElementById("addFavBtn");
  btn.classList.remove("added");

  // ============================
  // МИ НА СТОРІНЦІ ОБРАНЕ
  // ============================
  if (typeof IS_FAVORITES_PAGE !== "undefined" && IS_FAVORITES_PAGE) {
    btn.innerHTML = `
      <svg class="fav-icon-small" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
      Видалити з обраного
    `;

    btn.onclick = () => {
      removeFromFavorites(item);
      closeModal();
      renderFavs();
    };

  } else {

    // ============================
    // МИ НА ГОЛОВНІЙ
    // ============================
    if (isInFavorites(item)) {
      btn.classList.add("added");
      btn.innerHTML = `
        <svg class="fav-icon-small" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round"
             stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
        Додано
      `;
    } else {
      btn.innerHTML = `
        <svg class="fav-icon-small" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round"
             stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        Додати в обране
      `;
    }

    btn.onclick = () => {
      if (isInFavorites(item)) {
        removeFromFavorites(item);
        btn.classList.remove("added");
        btn.innerHTML = `
          <svg class="fav-icon-small" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Додати в обране
        `;
      } else {
        addToFavorites(item);
        btn.classList.add("added");
        btn.innerHTML = `
          <svg class="fav-icon-small" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
          Додано
        `;
      }
    };
  }

  modalOverlay.classList.add("active");
}

// ===============================
// ЗАКРИТТЯ МОДАЛКИ
// ===============================
function closeModal() {
  const modalOverlay = document.querySelector(".overlay");
  if (modalOverlay) modalOverlay.classList.remove("active");
}

const modalOverlay = document.querySelector(".overlay");
const modalClose = document.querySelector(".close");

if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

// ===============================
// РЕНДЕР ОБРАНОГО (favorites.html)
// ===============================
function renderFavs() {
  const favCards = document.getElementById("favCards");
  if (!favCards) return;

  const favs = safeGetFavorites();
  favCards.innerHTML = "";

  if (!favs.length) {
    favCards.innerHTML = `
      <div class="empty-favs">
        Немає обраних товарів. Поверніться на головну і додайте щось в обране.
      </div>
    `;
    return;
  }

  favs.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="card-body">
        <p class="category">${item.category}</p>
        <h3>${item.name}</h3>
        <p class="availability ${item.available ? "yes" : "no"}">
          ${item.available ? "Є в наявності" : "Немає"}
        </p>
      </div>
    `;

    card.addEventListener("click", () => openModal(item));
    favCards.appendChild(card);
  });
}
