/*
 * ФАНТИК-КАЗИНО — подключение проверенных candy-icons.
 * Подключать после основного inline-скрипта index.html.
 * Использует существующую candyArt() как fallback для остальных предметов.
 */
(function () {
  "use strict";

  // В mapping.json exact_match:true только для этих ID каталога (32 изображения).
  const VERIFIED_CANDY_IDS = new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42
  ]);

  // Сохраняем исходный генератор SVG: он останется fallback для 26 черновых
  // картинок и для случаев, когда файл WebP не загрузился.
  const originalCandyArt = window.candyArt;

  if (typeof originalCandyArt !== "function" || typeof CD === "undefined") {
    console.error("Candy icons: не найдены CD или исходная candyArt(). Скрипт подключён не после основного index.html.");
    return;
  }

  function getCatalogId(candy) {
    if (!candy) return 0;
    const index = CD.findIndex(item =>
      (candy.id && item.id === candy.id) ||
      (candy.n && item.n === candy.n)
    );
    return index >= 0 ? index + 1 : 0;
  }

  // Подменяем только источник изображения. Каталог, цены, экономика и логика
  // предметов остаются прежними. Общая card() использует этот helper в разных экранах.
  window.candyArt = function (candy) {
    const id = getCatalogId(candy);
    if (VERIFIED_CANDY_IDS.has(id)) {
      return `./candy-icons/candy-${String(id).padStart(2, "0")}.webp`;
    }
    return originalCandyArt(candy);
  };

  // Если WebP отсутствует или повреждён — возвращаем прежнюю SVG-иллюстрацию.
  document.addEventListener("error", function (event) {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains("candy-art")) return;
    if (img.dataset.candyFallback === "1") return;

    const card = img.closest(".ci");
    const name = card?.querySelector("b")?.textContent?.trim();
    const candy = CD.find(item => item.n === name);
    if (!candy) return;

    img.dataset.candyFallback = "1";
    img.src = originalCandyArt(candy);
  }, true);

  // Обновляем карточки, которые могли успеть нарисоваться до загрузки этого файла.
  document.querySelectorAll("img.candy-art").forEach(img => {
    const card = img.closest(".ci");
    const name = card?.querySelector("b")?.textContent?.trim();
    const candy = CD.find(item => item.n === name);
    if (candy) img.src = window.candyArt(candy);
  });

  console.info("Candy icons: подключены 32 проверенных изображения; остальные используют прежние SVG.");
})();
