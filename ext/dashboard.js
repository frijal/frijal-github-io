// ext/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("categories");
  const downloadBtn = document.getElementById("downloadBtn");

  // Load artikel.json dari folder artikel/
  const res = await fetch("/artikel/artikel.json");
  const data = await res.json();

  const categories = Object.keys(data);

  // Bagi ke 3 kolom
  const columnCount = 3;
  const columns = Array.from({ length: columnCount }, () => {
    const col = document.createElement("div");
    col.className = "column";
    container.appendChild(col);
    return col;
  });

  // Render kategori
  categories.forEach((cat, index) => {
    const col = columns[index % columnCount];

    const catDiv = document.createElement("div");
    catDiv.className = "category";
    catDiv.dataset.category = cat;

    const header = document.createElement("h3");
    header.textContent = cat;
    catDiv.appendChild(header);

    const list = document.createElement("div");
    list.className = "item-list";
    list.dataset.category = cat;

    data[cat].forEach(arr => {
      const [title, file, image, lastmod, description] = arr;

      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.draggable = true;

      // simpan data asli
      itemDiv.dataset.file = file;
      itemDiv.dataset.image = image;
      itemDiv.dataset.lastmod = lastmod;
      itemDiv.dataset.description = description;

      const img = document.createElement("img");
      img.src = image;
      img.alt = title;

      const span = document.createElement("span");
      span.textContent = title;

      itemDiv.appendChild(img);
      itemDiv.appendChild(span);

      addDragEvents(itemDiv);
      list.appendChild(itemDiv);
    });

    catDiv.appendChild(list);
    col.appendChild(catDiv);

    addDropEvents(list);
  });

  // Drag & Drop
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
        items.push([
          itemDiv.querySelector("span").textContent,
          itemDiv.dataset.file,
          itemDiv.dataset.image,
          itemDiv.dataset.lastmod,
          itemDiv.dataset.description
        ]);
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

