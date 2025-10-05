// ext/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("categories");
  const downloadBtn = document.getElementById("downloadBtn");

  // Load artikel.json dari folder artikel/
  const res = await fetch("/artikel/artikel.json");
  const data = await res.json();

  // Ambil semua kategori (7 total)
  const categories = Object.keys(data);

  // Bagi kategori jadi 3 kolom
  const columnCount = 3;
  const columns = Array.from({ length: columnCount }, () => {
    const col = document.createElement("div");
    col.className = "column";
    container.appendChild(col);
    return col;
  });

  // Render kategori + item ke kolom
  categories.forEach((cat, index) => {
    const col = columns[index % columnCount]; // bagi rata ke 3 kolom

    const catDiv = document.createElement("div");
    catDiv.className = "category";
    catDiv.dataset.category = cat;

    const header = document.createElement("h3");
    header.textContent = cat;
    catDiv.appendChild(header);

    const list = document.createElement("div");
    list.className = "item-list";
    list.dataset.category = cat;

    data[cat].forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.draggable = true;
      itemDiv.dataset.url = item.url;

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title;

      const title = document.createElement("span");
      title.textContent = item.title;

      itemDiv.appendChild(img);
      itemDiv.appendChild(title);

      addDragEvents(itemDiv);
      list.appendChild(itemDiv);
    });

    catDiv.appendChild(list);
    col.appendChild(catDiv);

    addDropEvents(list);
  });

  // Drag & Drop helpers
  let draggedItem = null;

  function addDragEvents(el) {
    el.addEventListener("dragstart", e => {
      draggedItem = el;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => (el.style.display = "none"), 0);
    });

    el.addEventListener("dragend", () => {
      draggedItem.style.display = "flex";
      draggedItem = null;
    });
  }

  function addDropEvents(list) {
    list.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    list.addEventListener("drop", e => {
      e.preventDefault();
      if (draggedItem) list.appendChild(draggedItem);
    });
  }

  // Download JSON hasil edit
  downloadBtn.addEventListener("click", () => {
    const newData = {};

    document.querySelectorAll(".category").forEach(catDiv => {
      const catName = catDiv.dataset.category;
      const items = [];
      catDiv.querySelectorAll(".item").forEach(itemDiv => {
        items.push({
          title: itemDiv.querySelector("span").textContent,
          image: itemDiv.querySelector("img").src,
          url: itemDiv.dataset.url
        });
      });
      newData[catName] = items;
    });

    const blob = new Blob([JSON.stringify(newData, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "artikel.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

