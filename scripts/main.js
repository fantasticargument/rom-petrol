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

// Закрити меню
if (menuClose) {
  menuClose.addEventListener('click', () => {
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
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
        <h3>${item.name}</h3>
        <p class="category">${item.category}</p>
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

const searchDesktop = document.getElementById('searchInputDesktop');
if (searchDesktop) {
  searchDesktop.addEventListener('input', () => {
    searchProducts(searchDesktop.value);
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
