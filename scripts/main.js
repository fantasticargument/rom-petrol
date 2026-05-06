document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // 1. Завантаження даних
  // =========================
  async function loadData() {
    const url = "https://billowing-dust-b910.romic-argument.workers.dev/";

    try {
      const response = await fetch(url);
      const data = await response.json();

      const items = data.records.map((record) => ({
        id: record.fields.id || 0,
        title: record.fields.Title || "",
        category: record.fields.Category || "",
        available: record.fields.Available || "",
        description: record.fields.Description || "",
        images: Array.isArray(record.fields.Images) ? record.fields.Images : [],
        code: record.fields.Code || "",
      }));

      // Сортування
      items.sort((a, b) => {
        const aAvailable = a.available.includes("Є") ? 1 : 0;
        const bAvailable = b.available.includes("Є") ? 1 : 0;

        if (aAvailable !== bAvailable) return bAvailable - aAvailable;
        return (a.id || 0) - (b.id || 0);
      });

      renderCards(items);
      setupCardClick(items);

    } catch (err) {
      console.error("Помилка завантаження:", err);
    }
  }

  // =========================
  // 2. Рендер карток
  // =========================
  function renderCards(items) {
    const container = document.querySelector(".cards");

    container.innerHTML = items
      .map((item) => {
        const imgUrl =
          item.images.length > 0 && item.images[0].url
            ? item.images[0].url
            : "placeholder.png";

        return `
          <div class="card" data-id="${item.id}">
            <img src="${imgUrl}" alt="${item.title}">

            <div class="card-body">
              <p class="category">${item.category}</p>
              <h3>${item.title}</h3>
            </div>

            <span class="availability ${
              item.available.includes("Є") ? "yes" : "no"
            }">${item.available}</span>
          </div>
        `;
      })
      .join("");
  }

  // =========================
  // 3. Клік по картці → модалка
  // =========================
  function setupCardClick(items) {
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        const item = items.find((i) => i.id == id);
        openModal(item);
      });
    });
  }

  // =========================
  // 4. Відкрити модалку
  // =========================
  function openModal(item) {
  const overlay = document.querySelector(".overlay");
  const gallery = document.querySelector(".modal-gallery");
  const mainImg = document.querySelector(".modal-img");

  // Безпечний масив фото
  const images = Array.isArray(item.images) ? item.images : [];

  // --- ГОЛОВНЕ ФОТО ---
  if (images.length > 0 && images[0].url) {
    mainImg.src = images[0].url;
  } else {
    mainImg.src = "placeholder.png";
  }

  // --- ГАЛЕРЕЯ ---
  if (images.length > 1) {
    gallery.innerHTML = images
      .map((img, index) => `
        <img 
          src="${img.url}" 
          data-index="${index}" 
          class="thumb"
          alt="${item.title}"
        >
      `)
      .join("");

    gallery.style.display = "flex";

    // Клік по мініатюрі → змінює головне фото
    gallery.querySelectorAll("img").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const idx = thumb.dataset.index;
        mainImg.src = images[idx].url;
      });
    });

  } else {
    gallery.innerHTML = "";
    gallery.style.display = "none";
  }

  // --- ТЕКСТОВІ ПОЛЯ ---
  document.getElementById("modalDescription").textContent = item.description;

  overlay.classList.remove("hidden");
}


  // =========================
  // 5. Закриття модалки
  // =========================
  function closeModal() {
    document.querySelector(".overlay").classList.add("hidden");
  }

  document.querySelector(".close").addEventListener("click", closeModal);

  document.querySelector(".overlay").addEventListener("click", (e) => {
    if (e.target.classList.contains("overlay")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // =========================
  // 6. Кнопка "вгору"
  // =========================
  const scrollBtn = document.getElementById("scrollTopBtn");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      scrollBtn.classList.add("show");
    } else {
      scrollBtn.classList.remove("show");
    }
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Запуск
  loadData();

});
