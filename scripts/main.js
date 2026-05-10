// ===============================
// ЗАВАНТАЖЕННЯ ДАНИХ З API
// ===============================

let PRODUCTS = [];

async function loadData() {
  try {
    const url = "https://billowing-dust-b910.romic-argument.workers.dev/";
    const response = await fetch(url);
    const data = await response.json();

    PRODUCTS = data.records.map(record => {
      const f = record.fields;

      // ID з Airtable
      const id = f.ID ?? f.Id ?? f.id ?? 0;

      // Available (рядок або boolean)
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

    // Сортування: Є → вгору, всередині — за ID
    PRODUCTS.sort((a, b) => {
      const aA = a.available ? 1 : 0;
      const bA = b.available ? 1 : 0;

      if (aA !== bA) return bA - aA;
      return a.id - b.id;
    });

    loadCards(PRODUCTS);
    buildSidebarCategories();
    buildMobileMenuCategories();

  } catch (err) {
    console.error("Помилка завантаження даних:", err);
  }
}

loadData();


// ===============================
// ПОВНОЕКРАННЕ МЕНЮ
// ===============================

const burger = document.querySelector('.burger');
const menuOverlay = document.querySelector('.menu-overlay');

if (burger) {
  burger.addEventListener('click', () => {
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

if (menuOverlay) {
  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
      menuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}


// ===============================
// КАРТКИ
// ===============================

const cardsContainer = document.querySelector('.cards');

function loadCards(data) {
  if (!cardsContainer) return;

  // 1. Перед рендером — ховаємо картки
  cardsContainer.classList.remove("loaded");
  cardsContainer.innerHTML = '';

  // 2. Рендеримо картки
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${item.image || 'images/placeholder.png'}" alt="${item.name}">
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

  // 3. Дозволяємо браузеру перемалювати DOM
  requestAnimationFrame(() => {
    cardsContainer.classList.add("loaded"); // ← плавна поява
  });
}

// ===============================
// ФІЛЬТРАЦІЯ КАТЕГОРІЙ
// ===============================

function filterByCategory(category) {
  const filtered = category === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(item => item.category === category);

  loadCards(filtered);
}


// ===============================
// САЙДБАР
// ===============================

function buildSidebarCategories() {
  const sidebarList = document.getElementById('categoryList');
  if (!sidebarList) return;

  const categories = [...new Set(PRODUCTS.map(p => p.category))];

  sidebarList.innerHTML = categories
    .map(cat => `<li data-category="${cat}">${cat}</li>`)
    .join("");

  sidebarList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      filterByCategory(e.target.dataset.category);
    }
  });
}


// ===============================
// МЕНЮ (МОБІЛЬНЕ)
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
// ПОШУК
// ===============================

function searchProducts(value) {
  const filtered = PRODUCTS.filter(item =>
    item.name.toLowerCase().includes(value.toLowerCase())
  );
  loadCards(filtered);
}

const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearSearch");

searchInput.addEventListener("input", () => {
  clearBtn.style.display = searchInput.value.length > 0 ? "block" : "none";
  searchProducts(searchInput.value);
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.style.display = "none";
  loadCards(PRODUCTS);
});


// ===============================
// МОДАЛКА
// ===============================

const modalOverlay = document.querySelector('.overlay');
const modalClose = document.querySelector('.close');

function openModal(item) {
  // Заповнення модалки
  document.getElementById('modalImage').src = item.image || "images/placeholder.png";
  document.querySelector('.modal-title').textContent = item.name;
  document.querySelector('.modal-category').textContent = item.category;
  document.querySelector('.modal-availability').textContent =
    item.available ? 'Є в наявності' : 'Немає';
  document.querySelector('.modal-description').textContent = item.description;
  document.querySelector('.modal-code').textContent = item.code || "";

  // Показуємо модалку
  modalOverlay.classList.add('active');

  // Кнопка
  const btn = document.querySelector('.add-fav-btn');

  // Скидаємо кнопку до початкового стану
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

  // Видаляємо старі слухачі, щоб не дублювалися
  btn.replaceWith(btn.cloneNode(true));
  const newBtn = document.querySelector('.add-fav-btn');

  // Додаємо новий слухач
  newBtn.addEventListener("click", function () {

    // Додаємо товар у обране
    addToFavorites(item);

    // Змінюємо кнопку на "Додано"
    newBtn.classList.add("added");
    newBtn.innerHTML = `
      <svg class="fav-icon-small" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
      Додано
    `;
  });
}


modalClose.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('active');
  }
});


// ===============================
// КНОПКА ВГОРУ
// ===============================

const scrollBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  scrollBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

scrollBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===============================
// Додати в обране
// ===============================

function addToFavorites(item) {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];

  const normalized = {
    id: item.id,
    name: item.name,
    category: item.category,
    available: item.available,
    description: item.description,
    code: item.code || "",
    image: item.image || "images/placeholder.png"
  };

  if (!favs.find(f => f.id === normalized.id)) {
    favs.push(normalized);
    localStorage.setItem("favorites", JSON.stringify(favs));
  }
}
