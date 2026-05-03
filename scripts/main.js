// === 1. Завантаження даних з Google Sheets ===

async function loadData() {
  const url =
    "https://docs.google.com/spreadsheets/d/1d03diyND3eYcbEbUrUK3DhDIclsvQRzZDscNgm_rLW8/pub?output=csv";

  const response = await fetch(url);
  const text = await response.text();

  const rows = text.split("\n").map((r) => r.split(","));

  const items = rows.slice(1).map((row, index) => ({
    id: index,
    available: row[1]?.trim(), // Наявність
    category: row[2]?.trim(), // Категорія
    title: row[3]?.trim(), // Найменування
    description: row[4]?.trim(), // Короткий опис
    image: row[5]?.trim(), // Картинка
    code: row[6]?.trim(), // Код
  }));

  renderCards(items);
  setupCardClick(items);
}

loadData();

// === 2. Рендер карточок ===

function renderCards(items) {
  const container = document.querySelector(".cards");

  container.innerHTML = items
    .map(
      (item) => `
    <div class="card" data-id="${item.id}">
      <img src="${item.image}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p class="category">${item.category}</p>
      <span class="availability ${
        item.available.includes("Є") ? "yes" : "no"
      }">${item.available}</span>
    </div>
  `
    )
    .join("");
}

// === 3. Обробка кліку по карточці ===

function setupCardClick(items) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const item = items[id];
      openModal(item);
    });
  });
}

// === 4. Модальне вікно ===

function openModal(item) {
  document.querySelector(".modal-img").src = item.image;
  document.querySelector(".modal-title").textContent = item.title;
  document.querySelector(".modal-category").textContent =
    "Категорія: " + item.category;
  document.querySelector(".modal-availability").textContent =
    "Наявність: " + item.available;
  document.querySelector(".modal-code").textContent = "Код: " + item.code;
  document.querySelector(".modal-description").textContent =
    item.description;

  document.querySelector(".overlay").classList.remove("hidden");
}

// Закриття модалки
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".overlay").classList.add("hidden");
});

// === 5. Додавання в обране ===

document.querySelector(".favorite-btn").addEventListener("click", () => {
  const title = document.querySelector(".modal-title").textContent;

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (!favorites.includes(title)) {
    favorites.push(title);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
});