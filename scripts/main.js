// ===============================
// ГЛОБАЛЬНІ ЕЛЕМЕНТИ
// ===============================
const cardsContainer = document.querySelector('.cards');
const menuOverlay = document.querySelector('.menu-overlay');
const burger = document.querySelector('.burger');
const scrollTopBtn = document.getElementById("scrollTopBtn");

let PRODUCTS = [];
let currentItem = null;

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
// РЕНДЕР КАРТОК
// ===============================
function loadCards(data) {
  if (!cardsContainer) return;

  cardsContainer.classList.remove("loaded");
  cardsContainer.innerHTML = '';

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img 
        src="${item.image || 'images/placeholder.png'}" 
        alt="${item.name}"
        onerror="this.src='images/placeholder.png'"
      >
      <div class="card-body">
        <p class="category">${item.category}</p>
        <h3>${item.name}</h3>
        <p class="availability ${item.available ? 'yes' : 'no'}">
          ${item.available ? 'Є в наявності' : 'Немає'}
        </p>
      </div>
    `;

    card.addEventListener('click', () => openModal(item));
    cardsContainer.appendChild(card);
  });

  requestAnimationFrame(() => {
    cardsContainer.classList.add("loaded");
  });
}

// ===============================
// ФІЛЬТР ЗА КАТЕГОРІЄЮ
// ===============================
function filterByCategory(category) {
  if (category === "all") {
    loadCards(PRODUCTS);
  } else {
    loadCards(PRODUCTS.filter(p => p.category === category));
  }
}

// ===============================
// САЙДБАР КАТЕГОРІЙ
// ===============================
//function buildSidebarCategories() {
 // const sidebarList = document.getElementById('categoryList');
 // if (!sidebarList) return;

 //  const categories = [...new Set(PRODUCTS.map(p => p.category))];

 // sidebarList.innerHTML = categories
 //   .map(cat => `<li data-category="${cat}">${cat}</li>`)
 //   .join("");

 // sidebarList.addEventListener('click', (e) => {
 //   if (e.target.tagName === 'LI') {
 //    filterByCategory(e.target.dataset.category);
 //   }
 // });
 //}

function buildCategoryList() {
  const list = document.getElementById("categoryList");
  if (!list) return;

  // Визначаємо джерело даних
  const source = (typeof IS_FAVORITES_PAGE !== "undefined")
    ? safeGetFavorites()
    : PRODUCTS;

  // Унікальні категорії
  let categories = [...new Set(source.map(p => p.category))];

  // Алфавітне сортування
  categories.sort((a, b) => a.localeCompare(b, "uk"));

  // Формуємо HTML
  list.innerHTML = `
    <li class="cat-item active" data-cat="all">Всі категорії</li>
    ${categories
      .map(cat => `<li class="cat-item" data-cat="${cat}">${cat}</li>`)
      .join("")}
  `;

  // Обробники кліку
  list.querySelectorAll(".cat-item").forEach(item => {
    item.addEventListener("click", () => {
      list.querySelectorAll(".cat-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");

      const cat = item.dataset.cat;

      if (typeof IS_FAVORITES_PAGE !== "undefined") {
        const favs = safeGetFavorites();
        const filtered = cat === "all" ? favs : favs.filter(p => p.category === cat);
        loadCards(filtered);
      } else {
        const filtered = cat === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
        loadCards(filtered);
      }
    });
  });
}

// ===============================
// МОБІЛЬНЕ МЕНЮ КАТЕГОРІЙ
// ===============================
function buildMobileMenuCategories() {
  const mobileList = document.getElementById('mobileCategoryList');
  if (!mobileList) return;

  let categories = [...new Set(PRODUCTS.map(p => p.category))];
  categories.sort((a, b) => a.localeCompare(b, 'uk'));

  mobileList.innerHTML = `
    <li data-category="all">Всі категорії</li>
    ${categories.map(cat => `<li data-category="${cat}">${cat}</li>`).join("")}
  `;

  mobileList.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      menuOverlay.classList.remove('active');
      document.body.style.overflow = '';

      if (item.dataset.category === "all") {
        loadCards(PRODUCTS);
      } else {
        filterByCategory(item.dataset.category);
      }
    });
  });
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

const modalOverlayEl = document.querySelector(".overlay");
const modalClose = document.querySelector(".close");

if (modalClose) modalClose.addEventListener("click", closeModal);

if (modalOverlayEl) {
  modalOverlayEl.addEventListener("click", (e) => {
    if (e.target === modalOverlayEl) closeModal();
  });
}

// ===============================
// РЕНДЕР ОБРАНОГО
// ===============================
function renderFavs() {
  const favCards = document.getElementById("favCards");
  if (!favCards) return;

  const favs = safeGetFavorites();
  favCards.innerHTML = `
  <div class="empty-favs">
    <div class="empty-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.7 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"></path>
      </svg>
    </div>

    <h3>У вас ще немає обраних товарів</h3>
    <p>Перегляньте каталог і додайте потрібні позиції в обране.</p>

    <a href="index.html" class="empty-btn">На головну</a>
  </div>
`;


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

  buildCategoryList();
}

// ===============================
// ПОШУК
// ===============================
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearSearch");

if (searchInput && clearBtn) {
  searchInput.addEventListener("input", () => {
    clearBtn.style.display = searchInput.value.length > 0 ? "block" : "none";

    const value = searchInput.value.toLowerCase();
    const filtered = PRODUCTS.filter(item =>
      item.name.toLowerCase().includes(value)
    );

    loadCards(filtered);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style.display = "none";
    loadCards(PRODUCTS);
  });
}

// ===============================
// БУРГЕР-МЕНЮ
// ===============================
if (burger && menuOverlay) {
  burger.addEventListener("click", () => {
    menuOverlay.classList.toggle("active");
    document.body.style.overflow =
      menuOverlay.classList.contains("active") ? "hidden" : "";
  });
}

// ===============================
// КНОПКА ВГОРУ
// ===============================
if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    scrollTopBtn.style.display = window.scrollY > 400 ? "block" : "none";
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ===============================
// ЗАВАНТАЖЕННЯ ДАНИХ
// ===============================
async function loadData() {
  try {
    const url = "https://billowing-dust-b910.romic-argument.workers.dev/";
    const response = await fetch(url);
    const data = await response.json();

    PRODUCTS = data.records.map(record => {
      const f = record.fields;

      const id = f.ID ?? f.Id ?? f.id ?? 0;

      const rawAvailable = f.Available;
      const available = typeof rawAvailable === "string"
        ? rawAvailable.includes("Є")
        : !!rawAvailable;

      return {
        id: Number(id) || 0,
        name: f.Title || "",
        category: f.Category || "",
        available,
        description: f.Description || "",
        image: f.Images?.[0]?.url || "placeholder.png",
        code: f.Code || ""
      };
    });

    PRODUCTS.sort((a, b) => {
      const aA = a.available ? 1 : 0;
      const bA = b.available ? 1 : 0;

      if (aA !== bA) return bA - aA;
      return a.id - b.id;
    });

    loadCards(PRODUCTS);
    buildCategoryList();
    //buildSidebarCategories();
    buildMobileMenuCategories();

  } catch (err) {
    console.error("Помилка завантаження даних:", err);
  }
}

if (typeof IS_FAVORITES_PAGE === "undefined") {
  loadData();
}