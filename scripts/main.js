async function loadData() {
  const url = "https://billowing-dust-b910.romic-argument.workers.dev/";

  const response = await fetch(url);
  const data = await response.json();

  const items = data.records.map((record, index) => ({
    id: index,
    title: record.fields.Title || "",
    category: record.fields.Category || "",
    available: record.fields.Available || "",
    description: record.fields.Description || "",
    images: record.fields.Images || [],
    code: record.fields.Code || "",
  }));

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


// МОДАЛЬНЕ ВІКНО + ГАЛЕРЕЯ
function setupCardClick(items) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      openModal(items[id]);
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
