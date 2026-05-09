// ===============================
// ЗАВАНТАЖЕННЯ ДАНИХ З API
// ===============================

let PRODUCTS = [];

async function loadData() {
  try {
    const url = "https://billowing-dust-b910.romic-argument.workers.dev/";
    const response = await fetch(url);
    const data = await response.json();

    PRODUCTS = data.records.map(record => ({
      name: record.fields.Title || "",
      category: record.fields.Category || "",
      available: record.fields.Available?.includes("Є") || false,
      description: record.fields.Description || "",
      image: record.fields.Images?.[0]?.url || "placeholder.png",
      code: record.fields.Code || ""
    }));

    // Сортування: Є → вгору
    PRODUCTS.sort((a, b) => {
  // 1. Спочатку — за наявністю
  const aA = a.available.includes("Є") ? 1 : 0;
  const bA = b.available.includes("Є") ? 1 : 0;

  if (aA !== bA) return bA - aA; // Є → вгору, Немає → вниз

  // 2. Якщо наявність однакова — за ID з Airtable
  return (a.id || 0) - (b.id || 0);
});


    loadCards(PRODUCTS);
    buildSidebarCategories();
    buildMobileMenuCategories();

  } catch (err) {
    console.error("Помилка завантаження даних:", err);
  }
}

loadData();

function buildSidebarCategories() {
  const sidebarList = document.getElementById('categoryList');
  if (!sidebarList) return;

  const categories = [...new Set(PRODUCTS.map(p => p.category))];

  sidebarList.innerHTML = categories
    .map(cat => `<li data-category="${cat}">${cat}</li>`)
    .join("");
}

function buildMobileMenuCategories() {
  const mobileList = document.getElementById('mobileCategoryList');
  if (!mobileList) return;

  // Унікальні категорії
  let categories = [...new Set(PRODUCTS.map(p => p.category))];

  // Алфавітне сортування
  categories.sort((a, b) => a.localeCompare(b, 'uk'));

  // Формуємо HTML
  mobileList.innerHTML = `
    <li data-category="all">Всі категорії</li>
    ${categories.map(cat => `<li data-category="${cat}">${cat}</li>`).join("")}
  `;

  // Обробники кліку
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
// ПОВНОЕКРАННЕ МЕНЮ
// ===============================

const burger = document.querySelector('.burger');
const menuOverlay = document.querySelector('.menu-overlay');
const menuClose = document.querySelector('.menu-close');
const menuItems = document.querySelectorAll('.menu-content li');

// Відкрити меню
if (burger) {
  burger.addEventListener('click', () => {
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

// Закриття при кліку на пункт меню
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
    filterByCategory(item.dataset.category);
  });
});

// Закриття при кліку по фону
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

  cardsContainer.innerHTML = '';

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
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

// Sidebar (десктоп)
const sidebarList = document.getElementById('categoryList');

if (sidebarList) {
  sidebarList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      filterByCategory(e.target.dataset.category);
    }
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

const searchMobile = document.getElementById('searchInput');
if (searchMobile) {
  searchMobile.addEventListener('input', () => {
    searchProducts(searchMobile.value);
  });
}


// ===============================
// МОДАЛКА
// ===============================

const modalOverlay = document.querySelector('.overlay');
const modalClose = document.querySelector('.close');

function openModal(item) {
  if (!modalOverlay) return;

  document.getElementById('modalImage').src = item.image;
  document.querySelector('.modal-title').textContent = item.name;
  document.querySelector('.modal-category').textContent = item.category;
  document.querySelector('.modal-availability').textContent =
    item.available ? 'Є в наявності' : 'Немає';
  document.querySelector('.modal-description').textContent = item.description;

  modalOverlay.classList.remove('hidden');
}

if (modalClose) {
  modalClose.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
  });
}

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.add('hidden');
    }
  });
}

// ===============================
// КНОПКА ВГОРУ
// ===============================

const scrollBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  if (!scrollBtn) return;
  scrollBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearSearch");

searchInput.addEventListener("input", () => {
  clearBtn.style.display = searchInput.value.length > 0 ? "block" : "none";
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.style.display = "none";

  // Повертаємо всі картки
  loadCards(PRODUCTS);
});
