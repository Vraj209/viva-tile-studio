(async () => {
  const gallery = document.querySelector("#work");
  const cards = [...gallery.querySelectorAll("[data-gallery-sample]")];
  const selectors = [...gallery.querySelectorAll('[aria-label="Choose a sample"] button')];
  const loads = await Promise.all(cards.map(async (card) => {
    const image = card.querySelector("img");
    const probe = new Image();
    probe.src = image.currentSrc || image.src;
    await probe.decode();
    return { src: new URL(probe.src).pathname, loaded: probe.naturalWidth > 0, alt: Boolean(image.alt) };
  }));
  const selections = [];
  for (const button of selectors) {
    button.click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    selections.push(button.getAttribute("aria-pressed") === "true");
  }
  const bounds = selectors.map((button) => button.getBoundingClientRect());
  return {
    samples: cards.length,
    selectorCount: selectors.length,
    everyImageLoaded: loads.every((item) => item.loaded),
    everyImageHasAlt: loads.every((item) => item.alt),
    everySelectionWorks: selections.every(Boolean),
    noHorizontalOverflow: document.documentElement.scrollWidth === innerWidth,
    indexFitsViewport: bounds.every((rect) => rect.left >= 0 && rect.right <= innerWidth),
    minimumTargetWidth: Math.min(...bounds.map((rect) => rect.width)),
    activeImage: gallery.querySelector('[data-active="true"] img')?.getAttribute("src"),
    errorOverlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay')),
  };
})()
