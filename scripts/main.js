async function loadData() {
  const url = "https://billowing-dust-b910.romic-argument.workers.dev/";

  const response = await fetch(url);
  const data = await response.json();

 const items = data.records.map((record) => ({
    id: record.fields.id || 0,   // ← ТЕПЕР ПРАВИЛЬНО
    title: record.fields.Title || "",
    category: record.fields.Category || "",
    available: record.fields.Available || "",
    description: record.fields.Description || "",
    images: record.fields.Images || [],
    code: record.fields.Code || "",
}));


  items.sort((a, b) => {
  // 1. Спочатку сортуємо за наявністю
  const aAvailable = a.available.includes("Є") ? 1 : 0;
  const bAvailable = b.available.includes("Є") ? 1 : 0;

  if (aAvailable !== bAvailable) {
    return bAvailable - aAvailable; // Є → вгору, Немає → вниз
  }

  // 2. Якщо наявність однакова — сортуємо за твоїм полем id
  return (a.id || 0) - (b.id || 0);
});

  renderCards(items);
  setupCardClick(items);
}

// РЕНДЕР КАРТОЧОК
function renderCards(items) {
  const container = document.querySelector(".cards");

  container.innerHTML = items
  .map(
    (item) => `
    <div class="card" data-id="${item.id}">
      <img src="${item.images[0]?.url || 'placeholder.png'}" alt="${item.title}">

      <div class="card-body">
        <p class="category">${item.category}</p>
        <h3>${item.title}</h3>
      </div>

      <span class="availability ${
        item.available.includes("Є") ? "yes" : "no"
      }">${item.available}</span>
    </div>
  `
  )
  .join("");

}


// МОДАЛЬНЕ ВІКНО + ГАЛЕРЕЯ
function setupCardClick(items) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const item = items.find(i => i.id == id); // ← шукаємо товар по id
      openModal(item);
    });
  });
}

function openModal(item) {
  const gallery = document.querySelector(".modal-gallery");
  gallery.innerHTML = item.images
    .map(img => `<img src="${img.url}" alt="${item.title}">`)
    .join("");

  document.querySelector(".modal-title").textContent = item.title;
  document.querySelector(".modal-category").textContent = item.category;
  document.querySelector(".modal-availability").textContent = item.available;
  document.querySelector(".modal-description").textContent = item.description;
  document.querySelector(".modal-code").textContent = item.code;

  document.querySelector(".overlay").classList.remove("hidden");
}
loadData();

function closeModal() {
  document.querySelector('.overlay').classList.add('hidden');
}

document.querySelector('.close').addEventListener('click', closeModal);

document.querySelector('.overlay').addEventListener('click', (e) => {
  if (e.target.classList.contains('overlay')) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
